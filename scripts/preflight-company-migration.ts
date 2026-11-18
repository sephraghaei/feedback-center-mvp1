import { readFileSync } from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb } from "../lib/db";

try {
  process.loadEnvFile(".env");
} catch {
  // Already provided by the shell.
}

function statements(tag: string): string[] {
  const text = readFileSync(path.join(process.cwd(), `drizzle/${tag}.sql`), "utf8");
  return text
    .split("--> statement-breakpoint")
    .map((part) => part.trim())
    .filter(Boolean);
}

async function main(): Promise<void> {
  const db = getDb();
  const counts = await db.execute(sql`
    select
      (select count(*)::int from posts where type = 'feedback') as feedback_posts,
      (select count(*)::int from changelog_entries) as changelog_entries,
      (select count(*)::int from users where role = 'admin') as admins
  `);
  console.log("rows to touch:", JSON.stringify(counts.rows));
  const tables = await db.execute(sql`
    select c.relname from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ('companies', 'company_members')
  `);
  console.log("existing new tables:", tables.rows.length);
  console.log("0010 statements:", statements("0010_cooing_franklin_storm").length);
  console.log("0011 statements:", statements("0011_companies").length);
  console.log("first 0011 statement:", statements("0011_companies")[0].split("\n")[0]);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(String(error));
  process.exit(1);
});
