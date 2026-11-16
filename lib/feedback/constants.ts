export const FEEDBACK_STATUSES = ["new", "planned", "in_progress", "shipped"] as const;
export const ROADMAP_STATUSES = ["planned", "in_progress", "shipped"] as const;
export const SUPPORT_STATUSES = ["open", "answered", "closed"] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];
