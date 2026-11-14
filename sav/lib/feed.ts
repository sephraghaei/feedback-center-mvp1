import type { SavClient } from "./supabase/server";
import { announcementCardSelect, asCards } from "./queries";
import type { AnnouncementCardData } from "./types";

export async function savedIdsOf(
  supabase: SavClient,
  userId: string | null | undefined,
) {
  if (!userId) return new Set<string>();
  const { data } = await supabase
    .from("saved_announcements")
    .select("announcement_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((row: { announcement_id: string }) => row.announcement_id));
}

export async function loadFeed(supabase: SavClient, limit = 30) {
  const { data } = await supabase
    .from("announcements")
    .select(announcementCardSelect)
    .eq("status", "published")
    .eq("businesses.status", "active")
    .order("published_at", { ascending: false })
    .limit(limit);
  return asCards(data);
}

export async function loadFollowingFeed(
  supabase: SavClient,
  userId: string,
  limit = 30,
) {
  const [{ data: businessRows }, { data: topicRows }] = await Promise.all([
    supabase.from("business_follows").select("business_id").eq("user_id", userId),
    supabase.from("topic_follows").select("topic_id").eq("user_id", userId),
  ]);

  const businessIds = (businessRows ?? []).map((row: { business_id: string }) => row.business_id);
  const topicIds = (topicRows ?? []).map((row: { topic_id: string }) => row.topic_id);
  if (businessIds.length === 0 && topicIds.length === 0) return [];

  const jobs: PromiseLike<unknown>[] = [];

  if (businessIds.length > 0) {
    jobs.push(
      supabase
        .from("announcements")
        .select(announcementCardSelect)
        .eq("status", "published")
        .eq("businesses.status", "active")
        .in("business_id", businessIds)
        .order("published_at", { ascending: false })
        .limit(limit),
    );
  }

  if (topicIds.length > 0) {
    jobs.push(
      supabase
        .from("announcement_topics")
        .select(`announcements!inner(${announcementCardSelect})`)
        .in("topic_id", topicIds)
        .eq("announcements.status", "published")
        .eq("announcements.businesses.status", "active")
        .limit(limit * 4),
    );
  }

  const results = await Promise.all(jobs);
  const merged = new Map<string, AnnouncementCardData>();

  for (const result of results) {
    const rows = (result as { data?: unknown }).data ?? [];
    for (const row of rows as Record<string, unknown>[]) {
      const embedded = row.announcements ?? row;
      const candidates = Array.isArray(embedded) ? embedded : [embedded];
      for (const candidate of candidates) {
        const card = candidate as AnnouncementCardData | null;
        if (card && card.id && !merged.has(card.id)) merged.set(card.id, card);
      }
    }
  }

  return [...merged.values()]
    .sort((left, right) =>
      (right.published_at ?? "").localeCompare(left.published_at ?? ""),
    )
    .slice(0, limit);
}
