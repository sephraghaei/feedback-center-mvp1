"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { addCompanyMember, updateCompany } from "@/lib/companies";
import { FEEDBACK_STATUSES } from "@/lib/feedback/constants";
import {
  PostError,
  createChangelogEntry,
  getPostDetail,
  isUuid,
  setPostStatus,
} from "@/lib/feedback/posts";
import { safeNext } from "@/lib/feedback/viewer";
import { localizeError } from "@/lib/i18n/errors";
import type { Locale } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { getWorkspaceContext, WORKSPACE_COMPANY_COOKIE } from "@/lib/workspace";

type Result = { ok: true } | { ok: false; error: string };

function message(error: unknown, locale: Locale): string {
  if (error instanceof PostError) return localizeError(error.message, locale);
  return localizeError("That action could not be completed. Try again.", locale);
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
  const back = safeNext(String(formData.get("back") ?? "/workspace/feedback"));

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
  const locale = await getLocale();
  const context = await getWorkspaceContext();
  if (!context) return { ok: false, error: localizeError("Open the workspace to publish updates.", locale) };
  if (!canManage(context.role, context.admin)) {
    return { ok: false, error: localizeError("Only company owners and admins can publish updates.", locale) };
  }

  try {
    const postIds = (Array.isArray(input.postIds) ? input.postIds : []).filter(isUuid);
    const id = await createChangelogEntry({
      companyId: context.company.id,
      title: input.title,
      body: input.body,
      postIds,
    });

    revalidatePath("/workspace/updates");
    revalidatePath("/workspace/feedback");
    revalidatePath("/workspace/roadmap");
    revalidatePath(`/c/${context.company.slug}/updates`);
    revalidatePath(`/c/${context.company.slug}/roadmap`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function saveCompanySettingsAction(input: {
  name: string;
  tagline: string;
  website: string;
  accent: string;
}): Promise<Result> {
  const locale = await getLocale();
  const context = await getWorkspaceContext();
  if (!context) return { ok: false, error: localizeError("Open the workspace to edit settings.", locale) };
  if (!canManage(context.role, context.admin)) {
    return { ok: false, error: localizeError("Only company owners and admins can change settings.", locale) };
  }

  try {
    await updateCompany(context.company.id, input);
    revalidatePath("/workspace");
    revalidatePath("/workspace/settings");
    revalidatePath(`/c/${context.company.slug}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}

export async function addMemberAction(email: string): Promise<Result> {
  const locale = await getLocale();
  const context = await getWorkspaceContext();
  if (!context) return { ok: false, error: localizeError("Open the workspace to invite teammates.", locale) };
  if (!canManage(context.role, context.admin)) {
    return { ok: false, error: localizeError("Only company owners and admins can add teammates.", locale) };
  }

  try {
    await addCompanyMember(context.company.id, email);
    revalidatePath("/workspace/team");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, locale) };
  }
}
