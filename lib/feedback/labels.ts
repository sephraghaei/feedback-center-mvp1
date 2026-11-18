export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  planned: "Planned",
  in_progress: "In progress",
  shipped: "Shipped",
  open: "Open",
  answered: "Answered",
  closed: "Closed",
};

export const TYPE_LABELS: Record<string, string> = {
  feedback: "Product feedback",
  support: "Private request",
};

export const FEEDBACK_KINDS = ["bug", "praise", "improvement"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export const KIND_LABELS: Record<FeedbackKind, string> = {
  bug: "Bug",
  praise: "Praise",
  improvement: "Improvement",
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

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export function formatDate(value: Date | string): string {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function statusTone(status: string): string {
  if (status === "shipped" || status === "answered") return "done";
  if (status === "planned" || status === "in_progress") return "progress";
  if (status === "closed") return "muted";
  return "open";
}
