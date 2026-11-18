import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb } from "../lib/db";

try {
  process.loadEnvFile(".env");
} catch {
  // Already provided by the shell.
}

const MIGRATIONS = ["0009_chilly_green_goblin", "0010_cooing_franklin_storm", "0011_companies"];

const journalFile = JSON.parse(
  readFileSync(path.join(process.cwd(), "drizzle/meta/_journal.json"), "utf8"),
) as { entries: { idx: number; tag: string; when: number }[] };

function sqlFile(tag: string): string {
  return readFileSync(path.join(process.cwd(), `drizzle/${tag}.sql`), "utf8");
}

function hashOf(tag: string): string {
  return createHash("sha256").update(sqlFile(tag)).digest("hex");
}

function statements(tag: string): string[] {
  return sqlFile(tag)
    .split("--> statement-breakpoint")
    .map((part) => part.trim())
    .filter(Boolean);
}

async function main(): Promise<void> {
  const db = getDb();

  const [head] = (
    await db.execute(sql`
      select id, hash from drizzle.__drizzle_migrations order by id desc limit 1
    `)
  ).rows as { id: number; hash: string }[];
  if (head?.hash !== hashOf("0008_sturdy_puck")) {
    throw new Error(`Unexpected journal head ${head?.id}; expected 0008. Aborting.`);
  }

  const applied = await db.execute(sql`
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'company_id'
  `);
  if (applied.rows.length > 0) throw new Error("posts.company_id already exists. Aborting.");

  await db.transaction(async (tx) => {
    for (const statement of statements("0010_cooing_franklin_storm")) {
      await tx.execute(sql.raw(statement));
    }
    console.log("0010 applied");
  });

  await db.transaction(async (tx) => {
    for (const statement of statements("0011_companies")) {
      await tx.execute(sql.raw(statement));
    }
    console.log("0011 applied");

    await tx.execute(sql`
      insert into companies (slug, name, tagline, accent, website)
      values ('vasa', 'Vasa', 'Customer feedback, organized.', '#2563eb', 'https://vasa.app')
      on conflict (slug) do nothing
    `);

    const feedback = (await tx.execute(sql`
      update posts set company_id = (select id from companies where slug = 'vasa')
      where company_id is null and type = 'feedback'
      returning id
    `)).rows.length;

    const entries = (await tx.execute(sql`
      update changelog_entries set company_id = (select id from companies where slug = 'vasa')
      where company_id is null
      returning id
    `)).rows.length;

    const owners = (await tx.execute(sql`
      insert into company_members (company_id, user_id, role)
      select c.id, u.id, 'owner'
      from companies c cross join users u
      where c.slug = 'vasa' and u.role = 'admin'
      on conflict do nothing
      returning user_id
    `)).rows.length;

    console.log(`backfill: ${feedback} feedback, ${entries} updates, ${owners} owners`);
  });

  for (const tag of MIGRATIONS) {
    const hash = hashOf(tag);
    const entry = journalFile.entries.find((row) => row.tag === tag);
    if (!entry) throw new Error(`Missing journal entry for ${tag}`);
    const existing = await db.execute(sql`
      select id from drizzle.__drizzle_migrations where hash = ${hash}
    `);
    if (existing.rows.length > 0) continue;
    await db.execute(sql`
      insert into drizzle.__drizzle_migrations (hash, created_at) values (${hash}, ${entry.when})
    `);
    console.log("journal row added:", tag);
  }

  const verify = await db.execute(sql`
    select
      (select count(*)::int from companies) as companies,
      (select count(*)::int from company_members) as members,
      (select count(*)::int from posts where type = 'feedback' and company_id is null) as orphan_feedback,
      (select count(*)::int from posts where type = 'feedback') as feedback_total,
      (select count(*)::int from changelog_entries where company_id is null) as orphan_updates,
      (select count(*)::int from drizzle.__drizzle_migrations) as journal_rows
  `);
  console.log("verify:", JSON.stringify(verify.rows));

  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
