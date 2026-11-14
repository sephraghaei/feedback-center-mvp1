import type { Dictionary } from "./i18n";

const map: Record<string, keyof Dictionary> = {
  forbidden: "errorForbidden",
  generic: "errorGeneric",
  urgent_not_allowed: "errorUrgentNotAllowed",
  slug_taken: "errorSlugTaken",
  invalid_slug: "errorInvalidSlug",
  invalid_name: "errorInvalidName",
  save_failed: "errorSave",
  invalid_email: "authInvalidEmail",
  send_failed: "authSendFailed",
  link: "authLinkError",
  business_created: "manageBusinessCreated",
  business_saved: "manageBusinessSaved",
  announcement_created: "manageAnnouncementCreated",
  announcement_saved: "manageAnnouncementSaved",
  announcement_published: "manageAnnouncementPublished",
  prefs_saved: "prefsSaved",
  all_read: "notificationsMarked",
  approved: "adminBusinessApproved",
  urgent_updated: "adminUrgentUpdated",
  removed: "adminAnnouncementRemoved",
  signed_out: "authSignedOut",
};

export function noticeText(code: string | null | undefined, t: Dictionary) {
  if (!code) return null;
  const key = map[code];
  return key ? t[key] : t.errorGeneric;
}

export function errorCodeFrom(error: { message?: string } | null | undefined) {
  const message = error?.message ?? "";
  for (const code of ["urgent_not_allowed", "slug_taken", "invalid_slug", "invalid_name", "profile_role_forbidden", "auth_required"]) {
    if (message.includes(code)) return code;
  }
  return "save_failed";
}
