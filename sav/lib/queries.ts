import type { Locale } from "./i18n";
import type { AnnouncementCardData, Topic } from "./types";

export const announcementCardSelect = `
  id,
  title,
  body,
  importance,
  published_at,
  business_id,
  attachment_url,
  businesses!inner (id, slug, name, logo_url),
  announcement_topics (topics (id, slug, name_fa, name_en))
`;

export function asCards(value: unknown): AnnouncementCardData[] {
  return (value ?? []) as AnnouncementCardData[];
}

export function taggedTopics(
  card: { announcement_topics: { topics: Topic | null }[] },
  locale: Locale,
) {
  return card.announcement_topics
    .map((row) => row.topics)
    .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
    .map((topic) => ({
      slug: topic.slug,
      name: locale === "fa" ? topic.name_fa : topic.name_en,
    }));
}

export function announcementHref(id: string) {
  return `/a/${id}`;
}
