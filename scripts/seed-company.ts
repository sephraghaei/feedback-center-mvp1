/**
 * Creates the default company workspace and attaches existing feedback and
 * changelog rows that predate multi-company support.
 */
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "../lib/db";
import { changelogEntries, companies, companyMembers, posts, users } from "../lib/db/schema";

try {
  process.loadEnvFile(".env");
} catch {
  // The environment may already come from the shell or CI.
}

const DEFAULT_COMPANY = {
  slug: "vasa",
  name: "Vasa",
  tagline: "Customer feedback, organized.",
  accent: "#2563eb",
  website: "https://vasa.app",
};

async function main(): Promise<void> {
  const db = getDb();

  await db.insert(companies).values(DEFAULT_COMPANY).onConflictDoNothing();

  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.slug, DEFAULT_COMPANY.slug))
    .limit(1);

  if (!company) throw new Error("Could not create the default company.");

  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  if (admins.length > 0) {
    await db
      .insert(companyMembers)
      .values(admins.map((admin) => ({ companyId: company.id, userId: admin.id, role: "owner" })))
      .onConflictDoNothing();
  }

  const attached = await db
    .update(posts)
    .set({ companyId: company.id })
    .where(and(isNull(posts.companyId), eq(posts.type, "feedback")))
    .returning({ id: posts.id });

  const updates = await db
    .update(changelogEntries)
    .set({ companyId: company.id })
    .where(isNull(changelogEntries.companyId))
    .returning({ id: changelogEntries.id });

  const [counts] = await db
    .select({
      admins: sql<number>`(select count(*)::int from ${companyMembers} where ${companyMembers.companyId} = ${company.id})`,
    })
    .from(companies)
    .where(eq(companies.id, company.id));

  console.log(
    `Company ${DEFAULT_COMPANY.slug} ready: ${attached.length} feedback attached, ${updates.length} updates attached, ${counts?.admins ?? 0} members.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
