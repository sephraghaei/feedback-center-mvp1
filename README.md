# black-project

A minimal black themed Next.js app, RTL and Persian, with Vazirmatn as the main font. The home page shows a centered `Hello`.

## Stack

Next.js (app router) on Cloudflare Workers through `@opennextjs/cloudflare`. The full stack is documented in [docs/main-stack.md](docs/main-stack.md) and the related files in [docs/](docs).

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Node 22 is required.

## Environment

Every variable lives in `.env` (see `.env.example` for the names). Local Wrangler values go in `.dev.vars`. Production secrets are set with `wrangler secret put`.

## Cloudflare

```bash
npm run build:cf   # build the worker into .open-next
npm run preview    # build and run the worker locally
npm run deploy     # migrate, build and deploy
```

For the Cloudflare Git integration, use `npx opennextjs-cloudflare build` as the build command and `npx opennextjs-cloudflare deploy` as the deploy command.
# feedback-center-mvp1
