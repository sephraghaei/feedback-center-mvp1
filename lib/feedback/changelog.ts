import { desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { changelogEntries, changelogPosts, posts } from "../db/schema";

export type ChangelogEntry = {
  id: string;
  title: string;
  body: string;
  publishedAt: Date;
};

export type ChangelogLinkedPost = {
  id: string;
  title: string;
  category: string | null;
};

export type ChangelogDetail = ChangelogEntry & { posts: ChangelogLinkedPost[] };

export async function listChangelog(limit = 30): Promise<ChangelogEntry[]> {
  return getDb()
    .select({
      id: changelogEntries.id,
      title: changelogEntries.title,
      body: changelogEntries.body,
      publishedAt: changelogEntries.publishedAt,
    })
    .from(changelogEntries)
    .orderBy(desc(changelogEntries.publishedAt))
    .limit(limit);
}

export async function getChangelogEntry(id: string): Promise<ChangelogDetail | null> {
  const [entry] = await getDb()
    .select({
      id: changelogEntries.id,
      title: changelogEntries.title,
      body: changelogEntries.body,
      publishedAt: changelogEntries.publishedAt,
    })
    .from(changelogEntries)
    .where(eq(changelogEntries.id, id))
    .limit(1);

  if (!entry) return null;

  const linked = await getDb()
    .select({ id: posts.id, title: posts.title, category: posts.category })
    .from(changelogPosts)
    .innerJoin(posts, eq(posts.id, changelogPosts.postId))
    .where(eq(changelogPosts.entryId, id));

  return { ...entry, posts: linked };
}

export async function resolveableFeedback(): Promise<ChangelogLinkedPost[]> {
  return getDb()
    .select({ id: posts.id, title: posts.title, category: posts.category })
    .from(posts)
    .where(eq(posts.type, "feedback"))
    .orderBy(desc(posts.createdAt))
    .limit(200);
}
