import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { changelogEntries, posts } from "../db/schema";

export type ChangelogEntry = {
  id: string;
  title: string;
  body: string;
  publishedAt: Date;
};

export type ChangelogLinkedPost = {
  id: string;
  title: string;
};

export async function listChangelog(limit = 30, companyId?: string): Promise<ChangelogEntry[]> {
  return getDb()
    .select({
      id: changelogEntries.id,
      title: changelogEntries.title,
      body: changelogEntries.body,
      publishedAt: changelogEntries.publishedAt,
    })
    .from(changelogEntries)
    .where(companyId ? eq(changelogEntries.companyId, companyId) : undefined)
    .orderBy(desc(changelogEntries.publishedAt))
    .limit(limit);
}

export async function resolveableFeedback(companyId?: string): Promise<ChangelogLinkedPost[]> {
  return getDb()
    .select({ id: posts.id, title: posts.title })
    .from(posts)
    .where(
      and(
        eq(posts.type, "feedback"),
        companyId ? eq(posts.companyId, companyId) : undefined,
      ),
    )
    .orderBy(desc(posts.createdAt))
    .limit(200);
}
