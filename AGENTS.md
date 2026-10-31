# Project rules

- Do not use an em-dash for anything in code, text and comments.
- Always RTL and Persian in the interface.
- Use the `---` font, or Vazirmatn when it does not exist. This project uses Vazirmatn.

The full stack lives in [docs/main-stack.md](docs/main-stack.md), with the details in:

- [docs/agent.md](docs/agent.md)
- [docs/cloudflare.md](docs/cloudflare.md)
- [docs/authentication.md](docs/authentication.md)
- [docs/sms.md](docs/sms.md)
- [docs/persian.md](docs/persian.md)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
