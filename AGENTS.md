# Project rules

- Do not use an em-dash for anything in code, text and comments.
- The interface is Persian RTL by default (`fc_locale` cookie, `fa`), with English LTR behind the language toggle (`fc_locale=en`). Every UI string goes through `t("فارسی", "English")` from `lib/i18n`, never a hardcoded one-language label.
- Fonts: the Apple Helvetica stack (`"Helvetica Neue", Helvetica, Arial, sans-serif`) is the English UI font; `:root[lang="fa"]` in `app/globals.css` swaps `--font-ui` to Vazirmatn and `--font-brand` to Noto Kufi Arabic for the Persian surface.
- Server actions and API routes return canonical English error messages and pass them through `localizeError(message, locale)` from `lib/i18n/errors.ts` so form errors follow the active language.

The full stack lives in [docs/main-stack.md](docs/main-stack.md), with the details in:

- [docs/agent.md](docs/agent.md)
- [docs/cloudflare.md](docs/cloudflare.md)
- [docs/authentication.md](docs/authentication.md)
- [docs/persian.md](docs/persian.md)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
