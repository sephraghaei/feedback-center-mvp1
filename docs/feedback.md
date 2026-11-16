# Feedback Center

The feedback surfaces are RTL and Persian like the rest of the app. Guests can read everything public; signed in customers can post, vote and follow their own submissions; admins triage and publish changelog entries.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/feed` | public | Post feed with category and status filters, vote buttons and the composer |
| `/roadmap` | public | Three columns: planned, in progress, shipped |
| `/changelog` | public | Published changelog entries |
| `/changelog/[id]` | public | One entry, its Markdown body and the feedback it closed |
| `/p/[id]` | public for feedback | Post detail with cover, body, attachments and changelog link |
| `/p/[id]` | author and admins for support | Support request detail |
| `/requests` | signed in | The viewer's own posts, split into public feedback and private support |
| `/admin/inbox` | admin | Support requests with reply and status |
| `/admin/posts` | admin | Feedback moderation: move status, hide, delete |
| `/admin/changelog` | admin | Publish entries and link the feedback they resolve |

There is no upload endpoint. The composer sends text only and the profile editor keeps the current avatar.

## Post model

`posts` holds both kinds in one table, separated by `type`:

- `feedback`: public. Categories are `bug`, `feature` and `improvement`. Statuses are `new`, `planned`, `in_progress` and `shipped`. Only `planned`, `in_progress` and `shipped` appear on the roadmap.
- `support`: private. Statuses are `open`, `answered` and `closed`. `admin_reply` keeps the answer the admin saved from the inbox.

A check constraint keeps each type on its own category and status set. Attachments live in `attachments` (at most 5 per post, 10 MB each, images and PDF) and votes in `upvotes` with a unique pair per user and post, so a second vote from the same account updates rather than duplicates.

## Privacy

Support requests must never be visible to anyone but their author and admins. The application enforces this in the data layer:

- `getPostDetail` returns a support post only when the viewer is its author or an admin. Every other viewer gets a 404, including guests.
- `listFeed`, `listRoadmap` and the author joins filter on `type = 'feedback'` and `hidden = false`.
- `listMyPosts` filters on `author_id = viewer.id`.
- Excerpts and votes are never rendered for support posts.

The database `postgres` role has `rolbypassrls`, so the RLS policies in `drizzle/0004_feedback_guards.sql` are defense in depth, not the boundary that keeps support private. Keep the checks in `lib/feedback/posts.ts` intact.

The signed in session is the existing `fc_session` cookie. The admin panel keeps its own `fc_admin` password cookie; the feedback admin pages require that cookie plus `users.role = 'admin'`. Set the role by hand:

```sql
update users set role = 'admin' where phone = '09...';
```

## Uploads

Uploads are disabled by request. The composer accepts text only and the profile editor does not change avatars, so there is no `/api/uploads` route and no server-side storage key. Existing covers and attachments from before the removal still render, with public URLs built from `NEXT_PUBLIC_SUPABASE_URL`.

## Changelog

Publishing an entry inserts `changelog_entries`, links posts through `changelog_posts` and stores the Markdown body. A trigger in `drizzle/0004_feedback_guards.sql` moves every linked feedback post to `shipped` on insert, so the roadmap, the badge and the entry stay in sync. Linked posts render a link to the entry on their detail page and in the feed.

## Admin addresses

Admin pages are separate from the public surface and keep the admin shell and password login. The feedback role is independent of the admin password: the password opens the panel, and the signed in user's `role` decides whether feedback actions are allowed.

## Development data

```bash
npm run migrate
npm run seed
```

`npm run seed` is idempotent. It replaces only its own rows: users `09120000001` to `09120000004`, `admin@feedback.local` and the demo changelog entry it creates. It also removes no other user or entry. Log in as `admin@feedback.local` through the email flow (development answers with `devCode`) to see the admin role, and use the phone numbers through the SMS flow (also `devCode` in development) to see the customer view and the support privacy behavior between two accounts.
