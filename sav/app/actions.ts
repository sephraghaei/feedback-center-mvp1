"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer, requireUser } from "@/lib/auth";
import { errorCodeFrom } from "@/lib/errors";
import { isEmail, safeNext } from "@/lib/format";
import { siteUrl } from "@/lib/env";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Importance, NotificationChannel } from "@/lib/types";

const IMPORTANCE: Importance[] = ["normal", "important", "urgent"];
const CHANNELS: NotificationChannel[] = ["in_app", "email"];

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function refresh() {
  revalidatePath("/", "layout");
}

function back(path: string, key: "ok" | "error", code: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${key}=${code}`);
}

export async function sendMagicLink(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const next = safeNext(text(formData, "next") || "/feed");

  if (!isEmail(email)) {
    redirect(`/sign-in?error=invalid_email&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(
      `/sign-in?error=send_failed&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(
    `/sign-in?sent=1&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`,
  );
}

export async function signOutAction() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  refresh();
  redirect("/feed?ok=signed_out");
}

export async function toggleBusinessFollow(formData: FormData) {
  const businessId = text(formData, "businessId");
  const next = safeNext(text(formData, "next"));
  const viewer = await requireUser(next);
  const supabase = await createSupabaseServer();

  const { data: existing } = await supabase
    .from("business_follows")
    .select("business_id")
    .eq("user_id", viewer.user!.id)
    .eq("business_id", businessId)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("business_follows")
        .delete()
        .eq("user_id", viewer.user!.id)
        .eq("business_id", businessId)
    : await supabase
        .from("business_follows")
        .insert({ user_id: viewer.user!.id, business_id: businessId });

  if (error) back(next, "error", errorCodeFrom(error));
  refresh();
  redirect(next);
}

export async function toggleTopicFollow(formData: FormData) {
  const topicId = text(formData, "topicId");
  const next = safeNext(text(formData, "next"));
  const viewer = await requireUser(next);
  const supabase = await createSupabaseServer();

  const { data: existing } = await supabase
    .from("topic_follows")
    .select("topic_id")
    .eq("user_id", viewer.user!.id)
    .eq("topic_id", topicId)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("topic_follows")
        .delete()
        .eq("user_id", viewer.user!.id)
        .eq("topic_id", topicId)
    : await supabase
        .from("topic_follows")
        .insert({ user_id: viewer.user!.id, topic_id: topicId });

  if (error) back(next, "error", errorCodeFrom(error));
  refresh();
  redirect(next);
}

export async function toggleSaved(formData: FormData) {
  const announcementId = text(formData, "announcementId");
  const next = safeNext(text(formData, "next"));
  const viewer = await requireUser(next);
  const supabase = await createSupabaseServer();

  const { data: existing } = await supabase
    .from("saved_announcements")
    .select("announcement_id")
    .eq("user_id", viewer.user!.id)
    .eq("announcement_id", announcementId)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("saved_announcements")
        .delete()
        .eq("user_id", viewer.user!.id)
        .eq("announcement_id", announcementId)
    : await supabase
        .from("saved_announcements")
        .insert({ user_id: viewer.user!.id, announcement_id: announcementId });

  if (error) back(next, "error", errorCodeFrom(error));
  refresh();
  redirect(next);
}

export async function markAllRead() {
  const viewer = await requireUser("/notifications");
  const supabase = await createSupabaseServer();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", viewer.user!.id)
    .eq("channel", "in_app")
    .is("read_at", null);
  refresh();
  back("/notifications", "ok", "all_read");
}

export async function markRead(formData: FormData) {
  const id = text(formData, "id");
  const next = safeNext(text(formData, "next"), "/notifications");
  const viewer = await requireUser(next);
  const supabase = await createSupabaseServer();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", viewer.user!.id);
  refresh();
  redirect(next);
}

export async function savePreferences(formData: FormData) {
  const viewer = await requireUser("/preferences");
  const supabase = await createSupabaseServer();

  function channels(level: string) {
    const values = formData.getAll(level).map(String);
    return CHANNELS.filter((channel) => values.includes(channel));
  }

  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: viewer.user!.id,
      normal_channels: channels("normal"),
      important_channels: channels("important"),
      urgent_channels: channels("urgent"),
    },
    { onConflict: "user_id" },
  );

  if (error) back("/preferences", "error", errorCodeFrom(error));
  refresh();
  back("/preferences", "ok", "prefs_saved");
}

export async function createBusiness(formData: FormData) {
  const viewer = await requireUser("/manage");
  const supabase = await createSupabaseServer();
  const slug = text(formData, "slug").toLowerCase();

  const { data, error } = await supabase.rpc("create_business", {
    p_name: text(formData, "name"),
    p_slug: slug,
    p_description: text(formData, "description") || null,
    p_logo_url: text(formData, "logoUrl") || null,
    p_contact_email: text(formData, "contactEmail") || null,
    p_website_url: text(formData, "websiteUrl") || null,
    p_primary_topic_id: text(formData, "primaryTopicId") || null,
  });

  if (error) {
    const code = error.message.includes("slug_taken")
      ? "slug_taken"
      : error.message.includes("invalid_slug")
        ? "invalid_slug"
        : error.message.includes("invalid_name")
          ? "invalid_name"
          : "save_failed";
    back("/manage", "error", code);
  }

  refresh();
  redirect(`/manage/${data as string}?ok=business_created`);
}

export async function updateBusiness(formData: FormData) {
  const id = text(formData, "id");
  await requireUser(`/manage/${id}`);
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("businesses")
    .update({
      name: text(formData, "name"),
      description: text(formData, "description") || null,
      logo_url: text(formData, "logoUrl") || null,
      contact_email: text(formData, "contactEmail") || null,
      website_url: text(formData, "websiteUrl") || null,
      primary_topic_id: text(formData, "primaryTopicId") || null,
    })
    .eq("id", id)
    .select("id");

  if (error) back(`/manage/${id}`, "error", errorCodeFrom(error));
  if (!data || data.length === 0) back(`/manage/${id}`, "error", "forbidden");
  refresh();
  back(`/manage/${id}`, "ok", "business_saved");
}

export async function saveAnnouncement(formData: FormData) {
  const viewer = await getViewer();
  const businessId = text(formData, "businessId");
  const announcementId = text(formData, "announcementId");
  const wantsPublish = text(formData, "intent") === "publish";
  const path = announcementId
    ? `/manage/${businessId}/announcements/${announcementId}`
    : `/manage/${businessId}/announcements/new`;

  if (!viewer.user) redirect(`/sign-in?next=${encodeURIComponent(path)}`);

  const supabase = await createSupabaseServer();
  const importance = (IMPORTANCE.includes(text(formData, "importance") as Importance)
    ? text(formData, "importance")
    : "normal") as Importance;

  let current: { id: string; status: string; business_id: string; published_at: string | null } | null = null;
  if (announcementId) {
    const { data } = await supabase
      .from("announcements")
      .select("id, status, business_id, published_at")
      .eq("id", announcementId)
      .maybeSingle();
    current = data;
    if (!current) back(path, "error", "forbidden");
  }

  const status = wantsPublish || current?.status === "published" ? "published" : "draft";
  const payload = {
    title: text(formData, "title"),
    body: text(formData, "body"),
    importance,
    status,
    attachment_url: text(formData, "attachmentUrl") || null,
    published_at:
      status === "published" ? current?.published_at ?? new Date().toISOString() : null,
  };

  if (!payload.title || !payload.body) back(path, "error", "save_failed");

  let id = announcementId;
  if (current) {
    const { data, error } = await supabase
      .from("announcements")
      .update(payload)
      .eq("id", announcementId)
      .select("id");
    if (error) back(path, "error", errorCodeFrom(error));
    if (!data || data.length === 0) back(path, "error", "forbidden");
  } else {
    const { data, error } = await supabase
      .from("announcements")
      .insert({
        ...payload,
        business_id: businessId,
        created_by: viewer.user.id,
      })
      .select("id")
      .single();
    if (error) back(path, "error", errorCodeFrom(error));
    id = data.id;
  }

  await supabase.from("announcement_topics").delete().eq("announcement_id", id);
  const topicIds = formData
    .getAll("topicIds")
    .map(String)
    .filter((value) => value.length > 0);
  if (topicIds.length > 0) {
    const { error } = await supabase
      .from("announcement_topics")
      .insert(topicIds.map((topicId) => ({ announcement_id: id, topic_id: topicId })));
    if (error) back(path, "error", errorCodeFrom(error));
  }

  refresh();
  const target = `/manage/${businessId}/announcements/${id}`;
  back(
    target,
    "ok",
    status === "published" && wantsPublish ? "announcement_published" : "announcement_saved",
  );
}

export async function approveBusiness(formData: FormData) {
  const viewer = await getViewer();
  if (!viewer.isAdmin) redirect("/feed?error=forbidden");
  const id = text(formData, "id");
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("businesses")
    .update({ status: "active" })
    .eq("id", id);
  if (error) back("/admin", "error", errorCodeFrom(error));
  refresh();
  back("/admin", "ok", "approved");
}

export async function setUrgentAllowed(formData: FormData) {
  const viewer = await getViewer();
  if (!viewer.isAdmin) redirect("/feed?error=forbidden");
  const id = text(formData, "id");
  const allowed = text(formData, "value") === "on";
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("businesses")
    .update({ urgent_allowed: allowed })
    .eq("id", id);
  if (error) back("/admin", "error", errorCodeFrom(error));
  refresh();
  back("/admin", "ok", "urgent_updated");
}

export async function removeAnnouncement(formData: FormData) {
  const viewer = await getViewer();
  if (!viewer.isAdmin) redirect("/feed?error=forbidden");
  const id = text(formData, "id");
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("announcements")
    .update({ status: "removed" })
    .eq("id", id);
  if (error) back("/admin", "error", errorCodeFrom(error));
  refresh();
  back("/admin", "ok", "removed");
}
