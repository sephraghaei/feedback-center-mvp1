import type { Dictionary, Locale } from "./i18n";

export type Importance = "normal" | "important" | "urgent";
export type AnnouncementStatus = "draft" | "published" | "archived" | "removed";
export type BusinessStatus = "pending" | "active" | "suspended";
export type NotificationChannel = "in_app" | "email";
export type MemberRole = "owner" | "editor";

export type Topic = {
  id: string;
  slug: string;
  name_fa: string;
  name_en: string;
};

export type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  contact_email: string | null;
  website_url: string | null;
  primary_topic_id: string | null;
  status: BusinessStatus;
  urgent_allowed: boolean;
  created_at: string;
};

export type AnnouncementCardData = {
  id: string;
  title: string;
  body: string;
  importance: Importance;
  published_at: string | null;
  business_id: string;
  attachment_url: string | null;
  businesses:
    | { id: string; slug: string; name: string; logo_url: string | null }
    | null;
  announcement_topics: { topics: Topic | null }[];
};

export type NotificationRow = {
  id: string;
  announcement_id: string;
  status: string;
  read_at: string | null;
  created_at: string;
  announcements:
    | {
        id: string;
        title: string;
        importance: Importance;
        published_at: string | null;
        businesses: { slug: string; name: string } | null;
      }
    | null;
};

export type Preferences = {
  normal_channels: NotificationChannel[];
  important_channels: NotificationChannel[];
  urgent_channels: NotificationChannel[];
};

export function topicName(topic: Pick<Topic, "name_fa" | "name_en">, locale: Locale) {
  return locale === "fa" ? topic.name_fa : topic.name_en;
}

export function importanceKey(importance: Importance): "importanceNormal" | "importanceImportant" | "importanceUrgent" {
  if (importance === "urgent") return "importanceUrgent";
  if (importance === "important") return "importanceImportant";
  return "importanceNormal";
}

export function statusKey(status: string): string {
  const map: Record<string, string> = {
    draft: "statusDraft",
    published: "statusPublished",
    archived: "statusArchived",
    removed: "statusRemoved",
    pending: "statusPending",
    active: "statusActive",
    suspended: "statusSuspended",
  };
  return map[status] ?? status;
}

export function statusLabel(t: Dictionary, status: string) {
  return t[statusKey(status) as keyof Dictionary];
}
