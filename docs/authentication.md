# Authentication

- Sign-in runs through Clerk: email or Google, no password and no phone number.
- `@clerk/nextjs` provides the session, the modal and the `/sign-in` page. Users are linked to `users.clerk_id` and get a `profiles` row through the profile step.
- The signed `fc_session` cookie is read only for accounts created before the switch to Clerk. Do not create new ones.
