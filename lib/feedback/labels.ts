export const STATUS_LABELS: Record<string, string> = {
  new: "جدید",
  planned: "برنامه‌ریزی شده",
  in_progress: "در حال انجام",
  shipped: "منتشر شده",
  open: "باز",
  answered: "پاسخ داده شده",
  closed: "بسته",
};

export const TYPE_LABELS: Record<string, string> = {
  feedback: "فید‌بک محصول",
  support: "درخواست شخصی",
};

export const FEEDBACK_KINDS = ["bug", "praise", "improvement"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export const KIND_LABELS: Record<FeedbackKind, string> = {
  bug: "خطا",
  praise: "تشکر",
  improvement: "بهبود",
};

export function isFeedbackKind(value: unknown): value is FeedbackKind {
  return typeof value === "string" && (FEEDBACK_KINDS as readonly string[]).includes(value);
}

export function feedbackKind(type: string, category: string | null): FeedbackKind | null {
  if (type !== "feedback") return null;
  if (isFeedbackKind(category)) return category;
  // Older posts stored "feature" or no category; both read as an improvement.
  return "improvement";
}

const dateFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });

export function faDate(value: Date | string): string {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function faNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function statusTone(status: string): string {
  if (status === "shipped" || status === "answered") return "done";
  if (status === "planned" || status === "in_progress") return "progress";
  if (status === "closed") return "muted";
  return "open";
}
