export type Locale = "fa" | "en";

export const LOCALE_COOKIE = "fc_locale";
export const DEFAULT_LOCALE: Locale = "fa";

export function isLocale(value: unknown): value is Locale {
  return value === "fa" || value === "en";
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return locale === "fa" ? "rtl" : "ltr";
}

export type T = (fa: string, en: string) => string;

export function translator(locale: Locale): T {
  return locale === "fa" ? (fa) => fa : (_fa, en) => en;
}
