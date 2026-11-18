"use client";

import { useLocale } from "@/lib/i18n/client";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";

export default function LanguageToggle({ className = "fb-link" }: { className?: string }) {
  const locale = useLocale();
  const next = locale === "fa" ? "en" : "fa";
  const label = locale === "fa" ? "Switch to English" : "تغییر زبان به فارسی";

  function switchLocale() {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    window.location.reload();
  }

  return (
    <button type="button" className={className} onClick={switchLocale} aria-label={label} title={label}>
      {locale === "fa" ? "EN" : "فا"}
    </button>
  );
}
