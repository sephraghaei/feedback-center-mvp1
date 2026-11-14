# Feedback-Center

A Next.js feedback center, RTL and Persian, with Vazirmatn as the main font. Guests read the feed, the roadmap and the changelog. Signed in customers post feedback or a private support request, upload images and PDFs, and vote. Admins triage posts and publish changelog entries. Login runs through phone OTP, email OTP or Clerk. The feedback details are in [docs/feedback.md](docs/feedback.md).

## Stack

Next.js (app router) with React 19 and TypeScript, deployed on Vercel. Users, OTP verifications and profiles are stored in Postgres through Drizzle ORM. The full stack is documented in [docs/main-stack.md](docs/main-stack.md) and the related files in [docs/](docs). Logging conventions are in [docs/logging.md](docs/logging.md).

## Local development

Postgres is required. Create the local database once, then install, migrate and run:

```bash
createdb feedback_center
cp .env.example .env
# set DATABASE_URL in .env
npm install
npm run migrate
npm run seed
npm run dev
```

Open http://localhost:3000. Node 22 is required. After changing `lib/db/schema.ts`, run `npm run db:generate` to create a new SQL migration and `npm run migrate` to apply it. `npm run seed` fills demo feedback, support requests, votes and one changelog entry; it only replaces its own demo rows, see [docs/feedback.md](docs/feedback.md).

## Environment

Every variable lives in `.env` (see `.env.example` for the names). Production values are set in the Vercel dashboard, never in the repository.

OTP behavior is configured by `OTP_LENGTH`, `OTP_EXPIRES_IN_SECONDS` and `OTP_ALLOWED_ATTEMPS`; Kavenegar uses `KAVENEGAR_API_KEY`, `KAVENEGAR_TEMPLATE` and `KAVENEGAR_SENDER_TYPE`. `BETTER_AUTH_SECRET` signs the session cookie. If it is missing, the signing key is derived from `KAVENEGAR_API_KEY` so login still works; set a dedicated secret to keep the two independent. With neither set, production auth routes answer 503.

`DATABASE_URL` is the Postgres connection string, for example `postgresql://USER@localhost:5432/feedback_center`. If it is absent, the app also accepts the values that managed Postgres integrations on Vercel inject: `POSTGRES_URL`, `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`, in that order. Run `npm run migrate` against that database before the app starts.

When the host ends in `.supabase.co` or `.supabase.com`, the app removes the `sslmode` and `sslrootcert` URL parameters and verifies the server against the bundled Supabase root CA in `lib/db/supabase-ca.ts`. Use the Supavisor pooler host `aws-0-<region>.pooler.supabase.com` with the `postgres.<project-ref>` user: direct `db.<project-ref>.supabase.co` connections publish only IPv6 addresses and fail with `ENOTFOUND` on IPv4 networks and on Vercel.

`GET /api/health` reports the database state without writing anything. It answers 200 when the schema is applied, 503 with `database: "not_configured"` when no connection string is set, and 503 with `database: "unreachable"` plus a short `reason` (`dns`, `connection_refused`, `auth_failed`, `tls` and so on) when the connection fails.

Logging uses `LOG_LEVEL`, `LOG_FORMAT` and `NEXT_PUBLIC_LOG_LEVEL`. Production defaults to structured JSON at `INFO`; see [docs/logging.md](docs/logging.md) for levels, fields and filtering.

Login works with a phone number through Kavenegar SMS or with an email through Resend. `KAVENEGAR_API_KEY` enables SMS codes; `RESEND_API_KEY` and `RESEND_FROM` enable email codes. Without either provider the request still succeeds in development and returns `devCode` for the interface.

Email and Google sign-in run through Clerk. `npx clerk init` writes development keys to `.env.local` (gitignored); in production set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the Clerk dashboard. The interface stays Persian and RTL through the `faIR` localization. Clerk users are linked to the same `users`/`profiles` tables by `clerk_id`, so the profile step and account card behave the same as phone login.

Feedback attachments are stored in Supabase Storage. Set `SUPABASE_SERVICE_ROLE_KEY` from Supabase Project Settings, then API to enable uploads; it is server only and must never be a `NEXT_PUBLIC_*` variable. The app creates the public `post-media` bucket on first upload. Without the key the rest of the site works, but the composer answers that storage is not configured on the server. Files are limited to 5 per post, 10 MB each, images and PDF.

## Admin panel

`/admin` is a separate RTL panel with four sections: a stats dashboard, the support inbox, feedback moderation and the changelog publisher. It signs in with a password only, read from `ADMIN_PASSWORD`; there is no email, phone or username. Set `ADMIN_PASSWORD` in `.env` locally and in the Vercel dashboard for production. Leaving it empty disables the panel: `/admin` redirects to `/admin/login`, which explains that the variable is missing.

The admin session is a signed `fc_admin` cookie (eight hours) separate from the user `fc_session`. Login attempts are rate limited per IP. User management lists the live `users` joined with `profiles` and supports search, method and profile filters, sorting, table/board/list views, pagination, create, edit, delete and bulk delete, with undo after destructive actions. The dashboard shows totals, profile completion, signup trend, login-method split and age/sex breakdowns, all computed from the database.

The feedback sections use the admin password plus `users.role = 'admin'` on the signed in customer account. Change a role by hand in the database. The inbox answers and closes support requests; moderation moves feedback between `new`, `planned`, `in_progress` and `shipped`, hides or deletes posts; publishing a changelog entry marks its linked feedback as shipped. See [docs/feedback.md](docs/feedback.md).

## Deployment

The project deploys on Vercel. Vercel detects Next.js, so no build config is needed: it runs `next build` and serves the output.

1. Import the repository `sephraghaei/feedback-center-mvp1` in Vercel.
2. Keep the framework preset on Next.js and leave the build command at its default.
3. Add the environment variables in Project Settings, then Environment Variables. Use the same names as `.env.example`:

```
NEXT_PUBLIC_NAME
BETTER_AUTH_URL
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
BETTER_AUTH_SECRET
ADMIN_PASSWORD
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
OTP_LENGTH
OTP_EXPIRES_IN_SECONDS
OTP_ALLOWED_ATTEMPS
KAVENEGAR_API_KEY
KAVENEGAR_TEMPLATE
KAVENEGAR_SENDER_TYPE
LOG_LEVEL
LOG_FORMAT
NEXT_PUBLIC_LOG_LEVEL
```

`BETTER_AUTH_URL` must be the production URL, for example `https://feedback-center-mvp1.vercel.app`.

Production needs a hosted Postgres, not the local database. Connect Supabase or Vercel Postgres from the Vercel Marketplace and the integration provides `POSTGRES_URL` (pooled, used by the app) and `POSTGRES_URL_NON_POOLING` (for migrations). If you prefer your own database, add its URL as `DATABASE_URL` for Production and Preview. Set the variable before the first deploy and redeploy after changing it, because Vercel only reads environment variables at build and start time.

With Supabase, take the session pooler connection string from Project Settings, then Database: `postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`. Apply the schema once from your machine, then check the route:

```bash
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres" npm run migrate
curl -s https://feedback-center-mvp1.vercel.app/api/health
```

A healthy deploy answers `{"ok":true,"database":"connected","tables":{"users":true,"profiles":true,"verifications":true}}`. A deployment that starts without a connection string logs `app.database.missing` and phone login answers 500, so check `/api/health` and the function logs after the first deploy.

4. Deploy. Every push to `main` redeploys the project, and every branch and pull request gets a preview deployment.

Secrets live in the Vercel dashboard, never in the repository. `.env` stays local.

## Cloudflare setup

The repository still contains the original Cloudflare Workers setup: `wrangler.jsonc`, `open-next.config.ts`, the `@opennextjs/cloudflare` dependency and the `build:cf`, `preview` and `deploy` scripts. It is inactive and does not affect Vercel, which only runs `next build`. Remove it if you have settled on Vercel for good.
# feedback-center-mvp1
