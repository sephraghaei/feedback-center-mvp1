"use server";

import { revalidatePath } from "next/cache";
import { addComment, removeOwnComment, setCommentVote, type CommentView } from "@/lib/feedback/comments";
import {
  PostError,
  answerSupport,
  createChangelogEntry,
  createPost,
  movePost,
  removeOwnPost,
  removePost,
  setPostHidden,
  toggleUpvote,
  type AttachmentInput,
} from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

type Result = { ok: true } | { ok: false; error: string };

function message(error: unknown): string {
  if (error instanceof PostError) return error.message;
  return "انجام این کار ممکن نشد. دوباره تلاش کن.";
}

export async function createPostAction(input: {
  type: string;
  category?: string | null;
  product?: string | null;
  title: string;
  body: string;
  attachments: AttachmentInput[];
  coverPath?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string; signIn?: boolean }> {
  const viewer = await getViewer();
  if (!viewer) {
    return { ok: false, error: "برای ثبت فید‌بک اول وارد حسابت شو.", signIn: true };
  }
  if (input.type !== "feedback" && input.type !== "support") {
    return { ok: false, error: "نوع فید‌بک معتبر نیست." };
  }

  try {
    const id = await createPost({
      authorId: viewer.userId,
      type: input.type,
      category: input.category,
      product: input.product,
      title: input.title,
      body: input.body,
      attachments: Array.isArray(input.attachments) ? input.attachments : [],
      coverPath: input.coverPath,
    });
    revalidatePath("/feed");
    revalidatePath("/roadmap");
    revalidatePath("/requests");
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function toggleUpvoteAction(
  postId: string,
): Promise<{ ok: true; upvoted: boolean; count: number } | { ok: false; error: string; signIn?: boolean }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "برای رای دادن اول وارد حسابت شو.", signIn: true };

  try {
    const state = await toggleUpvote(postId, viewer.userId);
    revalidatePath("/feed");
    revalidatePath("/roadmap");
    revalidatePath(`/p/${postId}`);
    return { ok: true, ...state };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function addCommentAction(
  postId: string,
  body: string,
  parentId?: string | null,
): Promise<{ ok: true; comment: CommentView } | { ok: false; error: string; signIn?: boolean }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "برای نوشتن کامنت اول وارد حسابت شو.", signIn: true };

  try {
    const comment = await addComment({
      postId,
      authorId: viewer.userId,
      authorName: viewer.name,
      body,
      parentId,
    });
    revalidatePath(`/p/${postId}`);
    return { ok: true, comment };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function voteCommentAction(
  commentId: string,
  value: number,
): Promise<
  { ok: true; score: number; myVote: number } | { ok: false; error: string; signIn?: boolean }
> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "برای رای دادن به کامنت اول وارد حسابت شو.", signIn: true };

  try {
    const state = await setCommentVote(commentId, viewer.userId, value);
    revalidatePath(`/p/${state.postId}`);
    return { ok: true, score: state.score, myVote: state.myVote };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function deleteOwnCommentAction(
  commentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "برای حذف کامنت اول وارد حسابت شو." };

  try {
    const { postId } = await removeOwnComment(commentId, viewer.userId);
    revalidatePath(`/p/${postId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function deleteOwnPostAction(
  postId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "برای حذف فید‌بک اول وارد حسابت شو." };

  try {
    await removeOwnPost(postId, viewer.userId);
    revalidatePath("/feed");
    revalidatePath("/roadmap");
    revalidatePath("/requests");
    revalidatePath("/admin/posts");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function movePostAction(postId: string, status: string): Promise<Result> {
  if (!(await isAdminRequest())) return { ok: false, error: "دسترسی مدیر لازم است." };
  try {
    await movePost(postId, status);
    revalidatePath("/roadmap");
    revalidatePath("/feed");
    revalidatePath(`/p/${postId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function hidePostAction(postId: string, hidden: boolean): Promise<Result> {
  if (!(await isAdminRequest())) return { ok: false, error: "دسترسی مدیر لازم است." };
  try {
    await setPostHidden(postId, hidden);
    revalidatePath("/feed");
    revalidatePath("/roadmap");
    revalidatePath("/admin/posts");
    revalidatePath(`/p/${postId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function deletePostAction(postId: string): Promise<Result> {
  if (!(await isAdminRequest())) return { ok: false, error: "دسترسی مدیر لازم است." };
  try {
    await removePost(postId);
    revalidatePath("/feed");
    revalidatePath("/roadmap");
    revalidatePath("/admin/posts");
    revalidatePath("/admin/inbox");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function answerSupportAction(
  postId: string,
  reply: string,
  status: string,
): Promise<Result> {
  if (!(await isAdminRequest())) return { ok: false, error: "دسترسی مدیر لازم است." };
  try {
    await answerSupport(postId, reply, status);
    revalidatePath("/admin/inbox");
    revalidatePath("/requests");
    revalidatePath(`/p/${postId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function publishChangelogAction(input: {
  title: string;
  body: string;
  postIds: string[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "دسترسی مدیر لازم است." };
  try {
    const id = await createChangelogEntry({
      title: input.title,
      body: input.body,
      postIds: Array.isArray(input.postIds) ? input.postIds : [],
    });
    revalidatePath("/changelog");
    revalidatePath("/admin/changelog");
    revalidatePath("/feed");
    revalidatePath("/roadmap");
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}
