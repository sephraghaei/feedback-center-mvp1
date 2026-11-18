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
} from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/server";
import { validateProfile } from "@/lib/profile";
import type { Locale } from "@/lib/i18n/locale";
import { saveProfile } from "@/lib/user-store";

type Result = { ok: true } | { ok: false; error: string };

function message(error: unknown, locale: Locale): string {
  if (error instanceof PostError) return localizeError(error.message, locale);
  return localizeError("That did not work. Try again.", locale);
}

export async function saveProfileAction(input: unknown): Promise<Result> {
  const locale = await getLocale();
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: localizeError("Log in first to edit your profile.", locale) };

  const result = validateProfile(input);
  if ("error" in result) return { ok: false, error: localizeError(result.error, locale) };

  const profile = result.profile;
  if (profile.avatarPath && !profile.avatarPath.startsWith(`avatars/${viewer.userId}/`)) {
    return { ok: false, error: localizeError("That profile photo is not valid.", locale) };
  }

  try {
    await saveProfile(viewer.userId, profile);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function createPostAction(input: {
  type: string;
  category?: string | null;
  product?: string | null;
  productUrl?: string | null;
  title: string;
  body: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string; signIn?: boolean }> {
  const locale = await getLocale();
  const viewer = await getViewer();
  if (!viewer) {
    return { ok: false, error: localizeError("Log in first to post feedback.", locale), signIn: true };
  }
  if (input.type !== "feedback" && input.type !== "support") {
    return { ok: false, error: localizeError("That feedback type is not valid.", locale) };
  }

  try {
    const id = await createPost({
      authorId: viewer.userId,
      type: input.type,
      category: input.category,
      product: input.product,
      productUrl: input.productUrl,
      title: input.title,
      body: input.body,
    });
    revalidatePath("/feed");
    revalidatePath("/");
    revalidatePath("/requests");
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function toggleUpvoteAction(
  postId: string,
): Promise<{ ok: true; upvoted: boolean; count: number } | { ok: false; error: string; signIn?: boolean }> {
  const locale = await getLocale();
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: localizeError("Log in first to vote.", locale), signIn: true };

  try {
    const state = await toggleUpvote(postId, viewer.userId);
    revalidatePath("/feed");
    revalidatePath("/");
    revalidatePath(`/p/${postId}`);
    return { ok: true, ...state };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function addCommentAction(
  postId: string,
  body: string,
  parentId?: string | null,
): Promise<{ ok: true; comment: CommentView } | { ok: false; error: string; signIn?: boolean }> {
  const locale = await getLocale();
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: localizeError("Log in first to write a comment.", locale), signIn: true };

  try {
    const comment = await addComment({
      postId,
      authorId: viewer.userId,
      authorName: viewer.name,
      authorAvatarPath: viewer.avatarPath,
      body,
      parentId,
    });
    revalidatePath(`/p/${postId}`);
    return { ok: true, comment };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function voteCommentAction(
  commentId: string,
  value: number,
): Promise<
  { ok: true; score: number; myVote: number } | { ok: false; error: string; signIn?: boolean }
> {
  const locale = await getLocale();
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: localizeError("Log in first to vote on comments.", locale), signIn: true };

  try {
    const state = await setCommentVote(commentId, viewer.userId, value);
    revalidatePath(`/p/${state.postId}`);
    return { ok: true, score: state.score, myVote: state.myVote };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function deleteOwnCommentAction(
  commentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const locale = await getLocale();
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: localizeError("Log in first to delete a comment.", locale) };

  try {
    const { postId } = await removeOwnComment(commentId, viewer.userId);
    revalidatePath(`/p/${postId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function deleteOwnPostAction(
  postId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const locale = await getLocale();
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: localizeError("Log in first to delete feedback.", locale) };

  try {
    await removeOwnPost(postId, viewer.userId);
    revalidatePath("/feed");
    revalidatePath("/");
    revalidatePath("/requests");
    revalidatePath("/admin/posts");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function movePostAction(postId: string, status: string): Promise<Result> {
  const locale = await getLocale();
  if (!(await isAdminRequest())) return { ok: false, error: localizeError("Admin access is required.", locale) };
  try {
    await movePost(postId, status);
    revalidatePath("/");
    revalidatePath("/feed");
    revalidatePath(`/p/${postId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function hidePostAction(postId: string, hidden: boolean): Promise<Result> {
  const locale = await getLocale();
  if (!(await isAdminRequest())) return { ok: false, error: localizeError("Admin access is required.", locale) };
  try {
    await setPostHidden(postId, hidden);
    revalidatePath("/feed");
    revalidatePath("/");
    revalidatePath("/admin/posts");
    revalidatePath(`/p/${postId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function deletePostAction(postId: string): Promise<Result> {
  const locale = await getLocale();
  if (!(await isAdminRequest())) return { ok: false, error: localizeError("Admin access is required.", locale) };
  try {
    await removePost(postId);
    revalidatePath("/feed");
    revalidatePath("/");
    revalidatePath("/admin/posts");
    revalidatePath("/admin/inbox");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function answerSupportAction(
  postId: string,
  reply: string,
  status: string,
): Promise<Result> {
  const locale = await getLocale();
  if (!(await isAdminRequest())) return { ok: false, error: localizeError("Admin access is required.", locale) };
  try {
    await answerSupport(postId, reply, status);
    revalidatePath("/admin/inbox");
    revalidatePath("/requests");
    revalidatePath(`/p/${postId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function publishChangelogAction(input: {
  title: string;
  body: string;
  postIds: string[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const locale = await getLocale();
  if (!(await isAdminRequest())) return { ok: false, error: localizeError("Admin access is required.", locale) };
  try {
    const id = await createChangelogEntry({
      title: input.title,
      body: input.body,
      postIds: Array.isArray(input.postIds) ? input.postIds : [],
    });
    revalidatePath("/admin/changelog");
    revalidatePath("/feed");
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}
