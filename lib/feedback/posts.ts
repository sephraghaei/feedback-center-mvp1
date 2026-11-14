import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  attachments,
  changelogEntries,
  changelogPosts,
  posts,
  profiles,
  upvotes,
  users,
} from "../db/schema";
import { ALLOWED_TYPES } from "./storage";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  MAX_FILES,
  ROADMAP_STATUSES,
  SUPPORT_STATUSES,
} from "./constants";

export {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  ROADMAP_STATUSES,
  SUPPORT_STATUSES,
} from "./constants";
export type {
  FeedbackCategory,
  FeedbackStatus,
  RoadmapStatus,
  SupportStatus,
} from "./constants";

export type PostSummary = {
  id: string;
  type: string;
  category: string | null;
  title: string;
  body: string;
  coverPath: string | null;
  status: string;
  hidden: boolean;
  createdAt: Date;
  authorId: string;
  authorName: string | null;
  upvotes: number;
  viewerUpvoted: boolean;
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

export type AttachmentInput = {
  path: string;
  fileName: string;
  fileType: string;
  size: number;
};

export class PostError extends Error {}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

function upvoteCount() {
  return sql<number>`(select count(*)::int from ${upvotes} where ${upvotes.postId} = ${posts.id})`;
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
    title: posts.title,
    body: posts.body,
    coverPath: posts.coverPath,
    status: posts.status,
    hidden: posts.hidden,
    createdAt: posts.createdAt,
    authorId: posts.authorId,
    authorName: profiles.name,
    upvotes: upvoteCount(),
    viewerUpvoted: viewerVoted(viewerId),
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

export async function listFeed(options: {
  category?: string;
  status?: string;
  viewerId?: string;
  limit?: number;
}): Promise<PostSummary[]> {
  const rows = await getDb()
    .select(summarySelect(options.viewerId))
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(posts.type, "feedback"),
        eq(posts.hidden, false),
        options.category && (FEEDBACK_CATEGORIES as readonly string[]).includes(options.category)
          ? eq(posts.category, options.category)
          : undefined,
        options.status && (FEEDBACK_STATUSES as readonly string[]).includes(options.status)
          ? eq(posts.status, options.status)
          : undefined,
      ),
    )
    .orderBy(desc(posts.createdAt))
    .limit(options.limit ?? 60);

  return rows;
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
  category?: string | null;
  title: string;
  body: string;
  attachments: AttachmentInput[];
  coverPath?: string | null;
}): Promise<string> {
  const title = cleanTitle(input.title);
  const body = cleanBody(input.body);

  let category: string | null = null;
  if (input.type === "feedback") {
    if (!input.category || !(FEEDBACK_CATEGORIES as readonly string[]).includes(input.category)) {
      throw new PostError("برای بازخورد محصول یکی از دسته‌ها را انتخاب کن.");
    }
    category = input.category;
  }

  const files = input.attachments.slice(0, MAX_FILES);
  for (const file of files) {
    if (!file.path.startsWith(`posts/${input.authorId}/`)) {
      throw new PostError("فایل پیوست معتبر نیست.");
    }
    if (!ALLOWED_TYPES[file.fileType]) {
      throw new PostError("نوع فایل پیوست مجاز نیست.");
    }
  }

  const cover =
    input.coverPath && files.some((file) => file.path === input.coverPath)
      ? input.coverPath
      : (files.find((file) => file.fileType.startsWith("image/"))?.path ?? null);

  return getDb().transaction(async (tx) => {
    const [row] = await tx
      .insert(posts)
      .values({
        authorId: input.authorId,
        type: input.type,
        category,
        title,
        body,
        coverPath: cover,
        status: input.type === "feedback" ? "new" : "open",
      })
      .returning({ id: posts.id });

    if (!row) throw new PostError("ثبت بازخورد انجام نشد.");

    if (files.length > 0) {
      await tx.insert(attachments).values(
        files.map((file) => ({
          postId: row.id,
          path: file.path,
          fileName: file.fileName.slice(0, 200),
          fileType: file.fileType,
          size: file.size,
        })),
      );
    }

    return row.id;
  });
}

export async function toggleUpvote(
  postId: string,
  userId: string,
): Promise<{ upvoted: boolean; count: number }> {
  if (!isUuid(postId)) throw new PostError("شناسه بازخورد معتبر نیست.");

  const db = getDb();
  const [post] = await db
    .select({ id: posts.id, type: posts.type, hidden: posts.hidden })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || post.type !== "feedback" || post.hidden) {
    throw new PostError("این بازخورد برای رای دادن در دسترس نیست.");
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
  if (!isUuid(postId)) throw new PostError("شناسه بازخورد معتبر نیست.");
  if (!(ROADMAP_STATUSES as readonly string[]).includes(status)) {
    throw new PostError("وضعیت انتخابی معتبر نیست.");
  }

  const updated = await getDb()
    .update(posts)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(posts.id, postId), eq(posts.type, "feedback")))
    .returning({ id: posts.id });

  if (updated.length === 0) throw new PostError("بازخورد پیدا نشد.");
}

export async function setPostHidden(postId: string, hidden: boolean): Promise<void> {
  if (!isUuid(postId)) throw new PostError("شناسه بازخورد معتبر نیست.");
  await getDb()
    .update(posts)
    .set({ hidden, updatedAt: new Date() })
    .where(eq(posts.id, postId));
}

export async function removePost(postId: string): Promise<void> {
  if (!isUuid(postId)) throw new PostError("شناسه بازخورد معتبر نیست.");
  await getDb().delete(posts).where(eq(posts.id, postId));
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
