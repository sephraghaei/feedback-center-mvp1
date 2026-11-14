export const CATEGORY_LABELS: Record<string, string> = {
  bug: "باگ",
  feature: "درخواست قابلیت",
  improvement: "بهبود",
};

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
  feedback: "بازخورد محصول",
  support: "درخواست شخصی",
};

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
