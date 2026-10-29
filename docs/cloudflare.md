# Cloudflare

Deploy this project on Cloudflare Workers using `@opennextjs/cloudflare`. Do not create a Dockerfile.

## Setup

- Install `@opennextjs/cloudflare` and `wrangler` (dev dependency).
- Create `wrangler.jsonc` with main `.open-next/worker.js`, an `ASSETS` binding pointing to `.open-next/assets`, the compatibility flags `nodejs_compat` and `global_fetch_strictly_public`, and a recent `compatibility_date`.
- Create `open-next.config.ts` with the default config.
- Use Node 22 for local development and for the build.

## Scripts in package.json

- `"dev": "next dev"`
- `"migrate": "tsx scripts/migrate.ts"`
- `"build:cf": "NODE_OPTIONS=--max-old-space-size=2048 opennextjs-cloudflare build"`
- `"preview": "npm run build:cf && opennextjs-cloudflare preview"`
- `"deploy": "npm run migrate && npm run build:cf && opennextjs-cloudflare deploy"`

## Rules

- Never run migrations at startup. Run them in the deploy script or in CI before deploying.
- Do not use sharp or libvips. Set `images.unoptimized` to `true` in the Next config, or use Cloudflare Images.
- Never bake secrets into the build. Keep variable names in `.env`, use `.dev.vars` for local Wrangler, and set production values with `wrangler secret put` (`DATABASE_URL`, `KAVENEGAR_API_KEY`, `BETTER_AUTH_SECRET`, and so on).
- If the database is Postgres, connect through Hyperdrive and add the binding in `wrangler.jsonc`.
- Use the default npm registry. Remove any custom mirror or registry config.
- Build command for Cloudflare Git integration: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`
