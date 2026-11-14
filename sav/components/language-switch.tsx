"use client";

import { LOCALE_COOKIE, type Locale } from "@/lib/locale";

export default function LanguageSwitch({ locale }: { locale: Locale }) {
  function pick(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    window.location.reload();
  }

  return (
    <div className="flex items-center rounded-lg border border-line bg-surface p-0.5 text-[0.7rem] font-medium">
      <button
        type="button"
        onClick={() => pick("fa")}
        aria-label="تغییر زبان به فارسی"
        className={`cursor-pointer rounded-md px-2 py-1 transition-colors ${
          locale === "fa" ? "bg-brand-soft text-brand" : "text-ink-3 hover:text-ink"
        }`}
      >
        فا
      </button>
      <button
        type="button"
        onClick={() => pick("en")}
        aria-label="Switch language to English"
        lang="en"
        className={`cursor-pointer rounded-md px-2 py-1 transition-colors ${
          locale === "en" ? "bg-brand-soft text-brand" : "text-ink-3 hover:text-ink"
        }`}
      >
        EN
      </button>
    </div>
  );
}
