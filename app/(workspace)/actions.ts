"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { addCompanyMember, updateCompany } from "@/lib/companies";
import { getDb } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { FEEDBACK_STATUSES } from "@/lib/feedback/constants";
import {
  PostError,
  createChangelogEntry,
  getPostDetail,
  isUuid,
  setPostStatus,
} from "@/lib/feedback/posts";
import { getWorkspaceContext, WORKSPACE_COMPANY_COOKIE } from "@/lib/workspace";

type Result = { ok: true } | { ok: false; error: string };

function message(error: unknown): string {
  if (error instanceof PostError) return error.message;
  return "That action could not be completed. Try again.";
}

function canManage(role: string, admin: boolean): boolean {
  return admin || role === "owner" || role === "admin";
}

export async function switchWorkspaceCompany(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const context = await getWorkspaceContext();
  if (!context) redirect("/workspace");

  const allowed = context.memberships.some((entry) => entry.company.slug === slug);
  if (!allowed) redirect("/workspace");

  const store = await cookies();
  store.set(WORKSPACE_COMPANY_COOKIE, slug, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/workspace");
}

export async function workspaceStatusAction(formData: FormData): Promise<void> {
  const postId = String(formData.get("postId") ?? "");
  const status = String(formData.get("status") ?? "");
  const back = String(formData.get("back") ?? "/workspace/feedback");

  const context = await getWorkspaceContext();
  if (!context) redirect("/workspace");
  if (!isUuid(postId) || !(FEEDBACK_STATUSES as readonly string[]).includes(status)) {
    redirect(back);
  }

  const post = await getPostDetail(postId, { isAdmin: true });
  if (!post || post.companyId !== context.company.id || post.type !== "feedback") {
    redirect(back);
  }

  await setPostStatus(postId, status);
  revalidatePath("/workspace");
  revalidatePath("/workspace/feedback");
  revalidatePath("/workspace/roadmap");
  revalidatePath(`/c/${context.company.slug}`);
  revalidatePath(`/c/${context.company.slug}/roadmap`);
  revalidatePath(`/c/${context.company.slug}/p/${postId}`);
  redirect(back);
}

export async function publishUpdateAction(input: {
  title: string;
  body: string;
  postIds: string[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const context = await getWorkspaceContext();
  if (!context) return { ok: false, error: "Open the workspace to publish updates." };
  if (!canManage(context.role, context.admin)) {
    return { ok: false, error: "Only company owners and admins can publish updates." };
  }

  try {
    const postIds = (Array.isArray(input.postIds) ? input.postIds : []).filter(isUuid);
    const id = await createChangelogEntry({
      companyId: context.company.id,
      title: input.title,
      body: input.body,
      postIds,
    });

    if (postIds.length > 0) {
      await getDb()
        .update(posts)
        .set({ status: "shipped", updatedAt: new Date() })
        .where(
          and(
            inArray(posts.id, postIds),
            eq(posts.companyId, context.company.id),
            eq(posts.type, "feedback"),
          ),
        );
    }

    revalidatePath("/workspace/updates");
    revalidatePath("/workspace/feedback");
    revalidatePath("/workspace/roadmap");
    revalidatePath(`/c/${context.company.slug}/updates`);
    revalidatePath(`/c/${context.company.slug}/roadmap`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function saveCompanySettingsAction(input: {
  name: string;
  tagline: string;
  website: string;
  accent: string;
}): Promise<Result> {
  const context = await getWorkspaceContext();
  if (!context) return { ok: false, error: "Open the workspace to edit settings." };
  if (!canManage(context.role, context.admin)) {
    return { ok: false, error: "Only company owners and admins can change settings." };
  }

  try {
    await updateCompany(context.company.id, input);
    revalidatePath("/workspace");
    revalidatePath("/workspace/settings");
    revalidatePath(`/c/${context.company.slug}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function addMemberAction(email: string): Promise<Result> {
  const context = await getWorkspaceContext();
  if (!context) return { ok: false, error: "Open the workspace to invite teammates." };
  if (!canManage(context.role, context.admin)) {
    return { ok: false, error: "Only company owners and admins can add teammates." };
  }

  try {
    await addCompanyMember(context.company.id, email);
    revalidatePath("/workspace/team");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}
