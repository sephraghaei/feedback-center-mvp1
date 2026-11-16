import { and, asc, desc, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  attachments,
  changelogEntries,
  changelogPosts,
  comments,
  posts,
  profiles,
  upvotes,
  users,
} from "../db/schema";
import { parseProduct, parseSiteUrl, productContext } from "./product";
import {
  FEEDBACK_STATUSES,
  ROADMAP_STATUSES,
  SUPPORT_STATUSES,
} from "./constants";

export {
  FEEDBACK_STATUSES,
  ROADMAP_STATUSES,
  SUPPORT_STATUSES,
} from "./constants";
export type {
  FeedbackStatus,
  RoadmapStatus,
  SupportStatus,
} from "./constants";

export type PostSummary = {
  id: string;
  type: string;
  category: string | null;
  product: string | null;
  productUrl: string | null;
  title: string;
  body: string;
  coverPath: string | null;
  status: string;
  hidden: boolean;
  createdAt: Date;
  authorId: string;
  authorName: string | null;
  authorAvatarPath: string | null;
  upvotes: number;
  viewerUpvoted: boolean;
  commentCount: number;
};

export type PostAttachment = {
  id: string;
  path: string;
  fileName: string;
  fileType: string;
  size: number;
};

export type PostDetail = PostSummary & {
  adminReply: string | null;
  attachments: PostAttachment[];
  changelog: { id: string; title: string } | null;
};

export type SupportRow = PostSummary & { authorEmail: string | null; adminReply: string | null };

export class PostError extends Error {}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

function upvoteCount() {
  return sql<number>`(select count(*)::int from ${upvotes} where ${upvotes.postId} = ${posts.id})`;
}

function commentCount() {
  return sql<number>`(select count(*)::int from ${comments} where ${comments.postId} = ${posts.id})`;
}

function viewerVoted(viewerId?: string) {
  if (!viewerId) return sql<boolean>`false`;
  return sql<boolean>`exists (
    select 1 from ${upvotes}
     where ${upvotes.postId} = ${posts.id}
       and ${upvotes.userId} = ${viewerId}::uuid
  )`;
}

function summarySelect(viewerId?: string) {
  return {
    id: posts.id,
    type: posts.type,
    category: posts.category,
    product: posts.product,
    productUrl: posts.productUrl,
    title: posts.title,
    body: posts.body,
    coverPath: posts.coverPath,
    status: posts.status,
    hidden: posts.hidden,
    createdAt: posts.createdAt,
    authorId: posts.authorId,
    authorName: profiles.name,
    authorAvatarPath: profiles.avatarPath,
    upvotes: upvoteCount(),
    viewerUpvoted: viewerVoted(viewerId),
    commentCount: commentCount(),
  };
}

function excerptOf(body: string): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 190 ? `${plain.slice(0, 190)}…` : plain;
}

export function excerpt(body: string): string {
  return excerptOf(body);
}

export type FeedSort = "votes" | "newest";

export async function listFeed(options: {
  status?: string;
  product?: string | null;
  excludeId?: string;
  viewerId?: string;
  limit?: number;
  sort?: FeedSort;
}): Promise<PostSummary[]> {
  const order =
    options.sort === "votes"
      ? [desc(upvoteCount()), desc(posts.createdAt)]
      : [desc(posts.createdAt)];

  const rows = await getDb()
    .select(summarySelect(options.viewerId))
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(posts.type, "feedback"),
        eq(posts.hidden, false),
        options.status && (FEEDBACK_STATUSES as readonly string[]).includes(options.status)
          ? eq(posts.status, options.status)
          : undefined,
        options.product ? eq(posts.product, options.product) : undefined,
        options.excludeId ? ne(posts.id, options.excludeId) : undefined,
      ),
    )
    .orderBy(...order)
    .limit(options.limit ?? 60);

  return rows;
}

export async function listFeedCompanies(): Promise<string[]> {
  const rows = await getDb()
    .select({ company: posts.product })
    .from(posts)
    .where(
      and(eq(posts.type, "feedback"), eq(posts.hidden, false), isNotNull(posts.product)),
    )
    .groupBy(posts.product)
    .orderBy(desc(sql`count(*)`), asc(posts.product));

  return rows
    .map((row) => row.company)
    .filter((company): company is string => Boolean(company));
}

export async function listRoadmap(viewerId?: string): Promise<PostSummary[]> {
  return getDb()
    .select(summarySelect(viewerId))
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(posts.type, "feedback"),
        eq(posts.hidden, false),
        inArray(posts.status, [...ROADMAP_STATUSES]),
      ),
    )
    .orderBy(
      sql`(select count(*)::int from ${upvotes} where ${upvotes.postId} = ${posts.id}) desc`,
      desc(posts.createdAt),
    );
}

export async function getPostDetail(
  id: string,
  viewer?: { userId?: string; isAdmin: boolean } | null,
): Promise<PostDetail | null> {
  if (!isUuid(id)) return null;

  const [row] = await getDb()
    .select({ ...summarySelect(viewer?.userId), adminReply: posts.adminReply })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(posts.id, id))
    .limit(1);

  if (!row) return null;

  const isAuthor = viewer?.userId === row.authorId;
  const isAdmin = viewer?.isAdmin === true;

  if (!isAdmin && row.type === "support" && !isAuthor) return null;
  if (!isAdmin && row.hidden && !isAuthor) return null;

  const [files, changelog] = await Promise.all([
    getDb()
      .select({
        id: attachments.id,
        path: attachments.path,
        fileName: attachments.fileName,
        fileType: attachments.fileType,
        size: attachments.size,
      })
      .from(attachments)
      .where(eq(attachments.postId, id))
      .orderBy(attachments.createdAt),
    getDb()
      .select({ id: changelogEntries.id, title: changelogEntries.title })
      .from(changelogPosts)
      .innerJoin(changelogEntries, eq(changelogEntries.id, changelogPosts.entryId))
      .where(eq(changelogPosts.postId, id))
      .orderBy(desc(changelogEntries.publishedAt))
      .limit(1),
  ]);

  return { ...row, attachments: files, changelog: changelog[0] ?? null };
}

export async function listMyPosts(userId: string): Promise<PostSummary[]> {
  return getDb()
    .select(summarySelect(userId))
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt));
}

export async function listSupportRequests(status?: string): Promise<SupportRow[]> {
  const rows = await getDb()
    .select({ ...summarySelect(), authorEmail: users.email, adminReply: posts.adminReply })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(posts.type, "support"),
        status && (SUPPORT_STATUSES as readonly string[]).includes(status)
          ? eq(posts.status, status)
          : undefined,
      ),
    )
    .orderBy(desc(posts.createdAt));
  return rows;
}

export async function listFeedbackForAdmin(limit = 200): Promise<PostSummary[]> {
  return getDb()
    .select(summarySelect())
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(posts.type, "feedback"))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}

export async function countOpenSupport(): Promise<number> {
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(posts)
    .where(and(eq(posts.type, "support"), eq(posts.status, "open")));
  return row?.n ?? 0;
}

export async function countFeedback(): Promise<number> {
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(posts)
    .where(eq(posts.type, "feedback"));
  return row?.n ?? 0;
}

export type ProfileStats = { feedback: number; votes: number; comments: number };

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [row] = await getDb()
    .select({
      feedback: sql<number>`(
        select count(*)::int from ${posts}
         where ${posts.authorId} = ${userId}::uuid
           and ${posts.type} = 'feedback'
           and ${posts.hidden} = false
      )`,
      votes: sql<number>`(
        select count(*)::int from ${upvotes}
          inner join ${posts} on ${posts.id} = ${upvotes.postId}
         where ${posts.authorId} = ${userId}::uuid
      )`,
      comments: sql<number>`(
        select count(*)::int from ${comments}
         where ${comments.authorId} = ${userId}::uuid
      )`,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row ?? { feedback: 0, votes: 0, comments: 0 };
}

function cleanTitle(value: string): string {
  const title = value.trim();
  if (title.length < 3) throw new PostError("عنوان باید حداقل ۳ نویسه باشد.");
  if (title.length > 140) throw new PostError("عنوان باید حداکثر ۱۴۰ نویسه باشد.");
  return title;
}

function cleanBody(value: string): string {
  const body = value.trim();
  if (body.length < 10) throw new PostError("متن باید حداقل ۱۰ نویسه باشد.");
  if (body.length > 20000) throw new PostError("متن بیش از حد بلند است.");
  return body;
}

export async function createPost(input: {
  authorId: string;
  type: "feedback" | "support";
  product?: string | null;
  productUrl?: string | null;
  title: string;
  body: string;
}): Promise<string> {
  const title = cleanTitle(input.title);
  const body = cleanBody(input.body);
  const product = parseProduct(input.product);
  if (!product.ok) throw new PostError(product.message);
  if (!product.value) throw new PostError("نام محصول را بنویس.");
  const site = parseSiteUrl(input.productUrl);
  if (!site.ok) throw new PostError(site.message);

  let productName = product.value;
  let productUrl = site.value;
  const existingLink = productContext(productName);
  if (existingLink?.href) {
    if (!productUrl) productUrl = existingLink.href;
    productName = new URL(existingLink.href).hostname.replace(/^www\./i, "");
  }

  return getDb().transaction(async (tx) => {
    const [row] = await tx
      .insert(posts)
      .values({
        authorId: input.authorId,
        type: input.type,
        product: productName,
        productUrl,
        title,
        body,
        status: input.type === "feedback" ? "new" : "open",
      })
      .returning({ id: posts.id });

    if (!row) throw new PostError("ثبت فید‌بک انجام نشد.");

    return row.id;
  });
}

export async function toggleUpvote(
  postId: string,
  userId: string,
): Promise<{ upvoted: boolean; count: number }> {
  if (!isUuid(postId)) throw new PostError("شناسه فید‌بک معتبر نیست.");

  const db = getDb();
  const [post] = await db
    .select({ id: posts.id, type: posts.type, hidden: posts.hidden })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || post.type !== "feedback" || post.hidden) {
    throw new PostError("این فید‌بک برای رای دادن در دسترس نیست.");
  }

  const [existing] = await db
    .select({ postId: upvotes.postId })
    .from(upvotes)
    .where(and(eq(upvotes.postId, postId), eq(upvotes.userId, userId)))
    .limit(1);

  if (existing) {
    await db.delete(upvotes).where(and(eq(upvotes.postId, postId), eq(upvotes.userId, userId)));
  } else {
    await db.insert(upvotes).values({ postId, userId }).onConflictDoNothing();
  }

  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(upvotes)
    .where(eq(upvotes.postId, postId));

  return { upvoted: !existing, count: row?.n ?? 0 };
}

export async function movePost(postId: string, status: string): Promise<void> {
  if (!isUuid(postId)) throw new PostError("شناسه فید‌بک معتبر نیست.");
  if (!(ROADMAP_STATUSES as readonly string[]).includes(status)) {
    throw new PostError("وضعیت انتخابی معتبر نیست.");
  }

  const updated = await getDb()
    .update(posts)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(posts.id, postId), eq(posts.type, "feedback")))
    .returning({ id: posts.id });

  if (updated.length === 0) throw new PostError("فید‌بک پیدا نشد.");
}

export async function setPostHidden(postId: string, hidden: boolean): Promise<void> {
  if (!isUuid(postId)) throw new PostError("شناسه فید‌بک معتبر نیست.");
  await getDb()
    .update(posts)
    .set({ hidden, updatedAt: new Date() })
    .where(eq(posts.id, postId));
}

export async function removePost(postId: string): Promise<void> {
  if (!isUuid(postId)) throw new PostError("شناسه فید‌بک معتبر نیست.");
  await getDb().delete(posts).where(eq(posts.id, postId));
}

export async function removeOwnPost(postId: string, authorId: string): Promise<void> {
  if (!isUuid(postId)) throw new PostError("شناسه فید‌بک معتبر نیست.");

  const deleted = await getDb()
    .delete(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, authorId)))
    .returning({ id: posts.id });

  if (deleted.length === 0) throw new PostError("این فید‌بک پیدا نشد یا مال تو نیست.");
}

export async function answerSupport(
  postId: string,
  reply: string,
  status: string,
): Promise<void> {
  if (!isUuid(postId)) throw new PostError("شناسه درخواست معتبر نیست.");
  if (!(SUPPORT_STATUSES as readonly string[]).includes(status)) {
    throw new PostError("وضعیت انتخابی معتبر نیست.");
  }

  const text = reply.trim();
  if (text.length > 10000) throw new PostError("متن پاسخ بیش از حد بلند است.");

  const updated = await getDb()
    .update(posts)
    .set({ adminReply: text || null, status, updatedAt: new Date() })
    .where(and(eq(posts.id, postId), eq(posts.type, "support")))
    .returning({ id: posts.id });

  if (updated.length === 0) throw new PostError("درخواست پشتیبانی پیدا نشد.");
}

export async function createChangelogEntry(input: {
  title: string;
  body: string;
  postIds: string[];
}): Promise<string> {
  const title = cleanTitle(input.title);
  const body = cleanBody(input.body);
  const ids = [...new Set(input.postIds.filter(isUuid))];

  return getDb().transaction(async (tx) => {
    const [entry] = await tx
      .insert(changelogEntries)
      .values({ title, body })
      .returning({ id: changelogEntries.id });

    if (!entry) throw new PostError("ثبت تغییرات انجام نشد.");

    if (ids.length > 0) {
      const valid = await tx
        .select({ id: posts.id })
        .from(posts)
        .where(and(inArray(posts.id, ids), eq(posts.type, "feedback")));

      if (valid.length > 0) {
        await tx
          .insert(changelogPosts)
          .values(valid.map((row) => ({ entryId: entry.id, postId: row.id })))
          .onConflictDoNothing();
      }
    }

    return entry.id;
  });
}
