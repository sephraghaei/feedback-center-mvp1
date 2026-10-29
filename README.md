# black-project

A minimal black themed Next.js app, RTL and Persian, with Vazirmatn as the main font. The home page shows a centered `Hello`.

## Stack

Next.js (app router) with React 19 and TypeScript, deployed on Vercel. The full stack is documented in [docs/main-stack.md](docs/main-stack.md) and the related files in [docs/](docs).

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Node 22 is required.

## Environment

Every variable lives in `.env` (see `.env.example` for the names). Production values are set in the Vercel dashboard, never in the repository.

## Deployment

The project deploys on Vercel. Vercel detects Next.js, so no build config is needed: it runs `next build` and serves the output.

1. Import the repository `sephraghaei/feedback-center-mvp1` in Vercel.
2. Keep the framework preset on Next.js and leave the build command at its default.
3. Add the environment variables in Project Settings, then Environment Variables. Use the same names as `.env.example`:

```
NEXT_PUBLIC_APP_NAME
BETTER_AUTH_URL
BETTER_AUTH_SECRET
DATABASE_URL
KAVENEGAR_API_KEY
KAVENEGAR_SENDER
```

`BETTER_AUTH_URL` must be the production URL, for example `https://feedback-center-mvp1.vercel.app`.

4. Deploy. Every push to `main` redeploys the project, and every branch and pull request gets a preview deployment.

Secrets live in the Vercel dashboard, never in the repository. `.env` stays local.

## Cloudflare setup

The repository still contains the original Cloudflare Workers setup: `wrangler.jsonc`, `open-next.config.ts`, the `@opennextjs/cloudflare` dependency and the `build:cf`, `preview` and `deploy` scripts. It is inactive and does not affect Vercel, which only runs `next build`. Remove it if you have settled on Vercel for good.
# feedback-center-mvp1
