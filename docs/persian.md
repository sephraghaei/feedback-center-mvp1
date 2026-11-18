# Persian Setting

- Persian RTL is the default surface (`fc_locale` cookie, default `fa`); English LTR is the international version behind the language toggle (`fc_locale=en`).
- Use a warm, conversational tone in Persian: action-led second person (می‌تونی, not می‌توانی), no formal register.
- Persian UI type is Vazirmatn Variable, set through `--font-ui` under `:root[lang="fa"]` in `app/globals.css`; the وسا wordmark uses Noto Kufi Arabic through `--font-brand`.
- Every UI string goes through `t("فارسی", "English")` from `lib/i18n`, so both languages stay in sync.
