import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import AuthFlow, { ClerkSignOutButton, LogoutButton } from "./components/auth-flow";
import { OTP_LENGTH } from "@/lib/config";
import { logger } from "@/lib/logger";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import { toPersianDigits } from "@/lib/phone";
import { ensureUserByClerkId, getProfile, loadUserWithProfile } from "@/lib/user-store";
import { userRef } from "@/lib/user-ref";

export default async function Home() {
  const cookieStore = await cookies();
  const session = readSession(cookieStore.get(SESSION_COOKIE)?.value);
  const { userId: clerkId } = await auth();

  let clerkUser: { email: string | null } | null = null;
  if (!session && clerkId) {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkId);
    clerkUser = { email: user.primaryEmailAddress?.emailAddress ?? null };
  }

  const user = session
    ? await loadUserWithProfile(session, session.profile)
    : clerkId
      ? { profile: await getProfile(await ensureUserByClerkId(clerkId, clerkUser?.email)) }
      : null;
  const profile = user?.profile ?? null;
  const status = !session && !clerkId ? "guest" : profile ? "ready" : "needs-profile";

  logger.info("page.home.view", {
    context: {
      status,
      authMethod: session ? session.method : clerkId ? "clerk" : "none",
      ...(session ? { userRef: userRef(session.phone ?? session.email) } : {}),
    },
  });

  return (
    <main className="page">
      <h1 className="title" dir="ltr">Feedback-center</h1>

      {profile && (session || clerkUser) ? (
        <section className="card" aria-label="حساب کاربری">
          <p className="card-greeting">سلام، {profile.name} عزیز</p>
          <p className="card-note">خوشحالیم که اینجایی.</p>

          <dl className="details">
            {session?.phone ? (
              <div className="detail">
                <dt>شماره موبایل</dt>
                <dd className="mono">{toPersianDigits(session.phone)}</dd>
              </div>
            ) : null}
            {session?.email ? (
              <div className="detail">
                <dt>ایمیل</dt>
                <dd className="mono ltr">{session.email}</dd>
              </div>
            ) : null}
            {clerkUser?.email ? (
              <div className="detail">
                <dt>ایمیل</dt>
                <dd className="mono ltr">{clerkUser.email}</dd>
              </div>
            ) : null}
            {profile.age ? (
              <div className="detail">
                <dt>سن</dt>
                <dd>{toPersianDigits(String(profile.age))} سال</dd>
              </div>
            ) : null}
            {profile.sex ? (
              <div className="detail">
                <dt>جنسیت</dt>
                <dd>{profile.sex}</dd>
              </div>
            ) : null}
            {profile.company ? (
              <div className="detail">
                <dt>نام شرکت</dt>
                <dd>{profile.company}</dd>
              </div>
            ) : null}
          </dl>

          {session ? <LogoutButton /> : <ClerkSignOutButton />}
        </section>
      ) : (
        <AuthFlow status={status} phone={session?.phone} codeLength={OTP_LENGTH} />
      )}
    </main>
  );
}
