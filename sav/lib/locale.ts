export const LOCALES = ["fa", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "sav-locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "fa" || value === "en";
}
