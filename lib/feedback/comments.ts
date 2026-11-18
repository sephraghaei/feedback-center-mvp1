import { and, desc, eq, ne, sql } from "drizzle-orm";
import { getDb } from "../db";
import { commentVotes, comments, posts, profiles, users } from "../db/schema";
import { PostError, isUuid } from "./posts";

export type CommentView = {
  id: string;
  parentId: string | null;
  body: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorAvatarPath: string | null;
  score: number;
  myVote: number;
};

export type CommentVoteState = { score: number; myVote: number; postId: string };

function scoreOf() {
  return sql<number>`coalesce((
    select sum(${commentVotes.value})::int
      from ${commentVotes}
     where ${commentVotes.commentId} = ${comments.id}
  ), 0)`;
}

function myVoteOf(viewerId?: string) {
  if (!viewerId) return sql<number>`0`;
  return sql<number>`coalesce((
    select ${commentVotes.value}
      from ${commentVotes}
     where ${commentVotes.commentId} = ${comments.id}
       and ${commentVotes.userId} = ${viewerId}::uuid
  ), 0)`;
}

function commentablePost(postId: string) {
  if (!isUuid(postId)) throw new PostError("That feedback id is not valid.");
  return getDb()
    .select({ id: posts.id, type: posts.type, hidden: posts.hidden })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
}

export async function listComments(postId: string, viewerId?: string): Promise<CommentView[]> {
  if (!isUuid(postId)) return [];

  return getDb()
    .select({
      id: comments.id,
      parentId: comments.parentId,
      body: comments.body,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: sql<string>`coalesce(${profiles.name}, nullif(split_part(${users.email}, '@', 1), ''), 'Member')`,
      authorAvatarPath: profiles.avatarPath,
      score: scoreOf(),
      myVote: myVoteOf(viewerId),
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));
}

function cleanComment(value: string): string {
  const body = value.trim();
  if (body.length < 2) throw new PostError("Comments need at least 2 characters.");
  if (body.length > 2000) throw new PostError("Comments can be up to 2000 characters.");
  return body;
}

export async function addComment(input: {
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarPath?: string | null;
  body: string;
  parentId?: string | null;
}): Promise<CommentView> {
  const body = cleanComment(input.body);

  const [post] = await commentablePost(input.postId);
  if (!post || post.type !== "feedback" || post.hidden) {
    throw new PostError("This feedback does not take comments.");
  }

  let parentId: string | null = null;
  if (input.parentId) {
    if (!isUuid(input.parentId)) throw new PostError("The comment you are replying to was not found.");

    const [parent] = await getDb()
      .select({ id: comments.id, postId: comments.postId, parentId: comments.parentId })
      .from(comments)
      .where(eq(comments.id, input.parentId))
      .limit(1);

    if (!parent || parent.postId !== post.id) {
      throw new PostError("The comment you are replying to was not found.");
    }
    if (parent.parentId) {
      throw new PostError("You can only reply to a top level comment.");
    }
    parentId = parent.id;
  }

  const [row] = await getDb()
    .insert(comments)
    .values({ postId: post.id, authorId: input.authorId, parentId, body })
    .returning({ id: comments.id, createdAt: comments.createdAt });

  if (!row) throw new PostError("The comment could not be saved.");

  return {
    id: row.id,
    parentId,
    body,
    createdAt: row.createdAt,
    authorId: input.authorId,
    authorName: input.authorName,
    authorAvatarPath: input.authorAvatarPath ?? null,
    score: 0,
    myVote: 0,
  };
}

export async function removeOwnComment(
  commentId: string,
  userId: string,
): Promise<{ postId: string }> {
  if (!isUuid(commentId)) throw new PostError("That comment id is not valid.");

  const db = getDb();
  const [row] = await db
    .select({ postId: comments.postId, authorId: comments.authorId, parentId: comments.parentId })
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!row) throw new PostError("That comment was not found.");
  if (row.authorId !== userId) throw new PostError("You can only delete your own comment.");

  if (!row.parentId) {
    const [otherReply] = await db
      .select({ id: comments.id })
      .from(comments)
      .where(and(eq(comments.parentId, commentId), ne(comments.authorId, userId)))
      .limit(1);
    if (otherReply) throw new PostError("This comment has replies, so it cannot be deleted.");
  }

  await db.delete(comments).where(eq(comments.id, commentId));
  return { postId: row.postId };
}

export async function setCommentVote(
  commentId: string,
  userId: string,
  value: number,
): Promise<CommentVoteState> {
  if (!isUuid(commentId)) throw new PostError("That comment id is not valid.");
  if (value !== 1 && value !== -1 && value !== 0) throw new PostError("That vote is not valid.");

  const db = getDb();
  const [row] = await db
    .select({ postId: comments.postId, type: posts.type, hidden: posts.hidden })
    .from(comments)
    .innerJoin(posts, eq(posts.id, comments.postId))
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!row || row.type !== "feedback" || row.hidden) {
    throw new PostError("This comment is not open for voting.");
  }

  if (value === 0) {
    await db
      .delete(commentVotes)
      .where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)));
  } else {
    await db
      .insert(commentVotes)
      .values({ commentId, userId, value })
      .onConflictDoUpdate({
        target: [commentVotes.commentId, commentVotes.userId],
        set: { value },
      });
  }

  const [score] = await db
    .select({ n: sql<number>`coalesce(sum(${commentVotes.value})::int, 0)` })
    .from(commentVotes)
    .where(eq(commentVotes.commentId, commentId));

  return { score: score?.n ?? 0, myVote: value, postId: row.postId };
}
