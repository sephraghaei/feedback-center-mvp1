import type { Locale } from "@/lib/i18n/locale";

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  planned: "Planned",
  in_progress: "In progress",
  shipped: "Shipped",
  open: "Open",
  answered: "Answered",
  closed: "Closed",
};

export const STATUS_LABELS_FA: Record<string, string> = {
  new: "جدید",
  planned: "برنامه‌ریزی شده",
  in_progress: "در حال انجام",
  shipped: "منتشر شده",
  open: "باز",
  answered: "پاسخ داده شده",
  closed: "بسته",
};

export function statusLabel(status: string, locale: Locale): string {
  return (locale === "fa" ? STATUS_LABELS_FA : STATUS_LABELS)[status] ?? status;
}

export const TYPE_LABELS: Record<string, string> = {
  feedback: "Product feedback",
  support: "Private request",
};

export const TYPE_LABELS_FA: Record<string, string> = {
  feedback: "فیدبک محصول",
  support: "درخواست خصوصی",
};

export function typeLabel(type: string, locale: Locale): string {
  return (locale === "fa" ? TYPE_LABELS_FA : TYPE_LABELS)[type] ?? type;
}

export const FEEDBACK_KINDS = ["bug", "praise", "improvement"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export const KIND_LABELS: Record<FeedbackKind, string> = {
  bug: "Bug",
  praise: "Praise",
  improvement: "Improvement",
};

export const KIND_LABELS_FA: Record<FeedbackKind, string> = {
  bug: "خطا",
  praise: "تشکر",
  improvement: "بهبود",
};

export function kindLabel(kind: FeedbackKind, locale: Locale): string {
  return (locale === "fa" ? KIND_LABELS_FA : KIND_LABELS)[kind];
}

export function isFeedbackKind(value: unknown): value is FeedbackKind {
  return typeof value === "string" && (FEEDBACK_KINDS as readonly string[]).includes(value);
}

export function feedbackKind(type: string, category: string | null): FeedbackKind | null {
  if (type !== "feedback") return null;
  if (isFeedbackKind(category)) return category;
  // Older posts stored "feature" or no category; both read as an improvement.
  return "improvement";
}

const dateFormatters = {
  en: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }),
  fa: new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium" }),
};

const numberFormatters = {
  en: new Intl.NumberFormat("en-US"),
  fa: new Intl.NumberFormat("fa-IR"),
};

export function formatDate(value: Date | string, locale: Locale = "en"): string {
  return dateFormatters[locale].format(typeof value === "string" ? new Date(value) : value);
}

export function formatNumber(value: number, locale: Locale = "en"): string {
  return numberFormatters[locale].format(value);
}

export function statusTone(status: string): string {
  if (status === "shipped" || status === "answered") return "done";
  if (status === "planned" || status === "in_progress") return "progress";
  if (status === "closed") return "muted";
  return "open";
}
