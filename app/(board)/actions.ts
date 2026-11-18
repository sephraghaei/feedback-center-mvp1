"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyBySlug, getMembership } from "@/lib/companies";
import { FEEDBACK_STATUSES } from "@/lib/feedback/constants";
import {
  PostError,
  createPost,
  getPostDetail,
  isUuid,
  setPostStatus,
} from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; error: string; signIn?: boolean };

export async function submitFeedbackAction(
  slug: string,
  input: { kind: string; title: string; body: string },
): Promise<SubmitResult> {
  const viewer = await getViewer();
  if (!viewer) {
    return { ok: false, error: "Sign in to post feedback.", signIn: true };
  }

  const company = await getCompanyBySlug(slug);
  if (!company) return { ok: false, error: "That board could not be found." };

  try {
    const id = await createPost({
      authorId: viewer.userId,
      companyId: company.id,
      type: "feedback",
      category: input.kind,
      product: company.name,
      productUrl: company.website,
      title: input.title,
      body: input.body,
    });
    revalidatePath(`/c/${slug}`);
    revalidatePath(`/c/${slug}/roadmap`);
    revalidatePath("/workspace");
    return { ok: true, id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof PostError ? error.message : "Could not save your feedback.",
    };
  }
}

export async function updateFeedbackStatusAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const postId = String(formData.get("postId") ?? "");
  const status = String(formData.get("status") ?? "");
  const back = String(formData.get("back") ?? `/c/${slug}`);

  const viewer = await getViewer();
  if (!viewer) redirect(`/?next=${encodeURIComponent(back)}#account`);

  const company = await getCompanyBySlug(slug);
  if (!company) redirect("/");

  const [admin, role] = await Promise.all([
    isAdminRequest(),
    getMembership(company.id, viewer.userId),
  ]);
  if (!admin && !role) redirect(back);
  if (!isUuid(postId) || !(FEEDBACK_STATUSES as readonly string[]).includes(status)) {
    redirect(back);
  }

  const post = await getPostDetail(postId, { isAdmin: true });
  if (!post || post.companyId !== company.id || post.type !== "feedback") redirect(back);

  await setPostStatus(postId, status);
  revalidatePath(`/c/${slug}`);
  revalidatePath(`/c/${slug}/roadmap`);
  revalidatePath(`/c/${slug}/p/${postId}`);
  revalidatePath("/workspace");
  redirect(back);
}
