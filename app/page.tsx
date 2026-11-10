import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import Link from "next/link";
import AuthFlow, { ClerkSignOutButton, LogoutButton } from "./components/auth-flow";
import ThemeToggle from "./components/theme-toggle";
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
    <div className="shell">
      <header className="site-nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand" aria-label="Feedback-center">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-triangle" />
            </span>
            <span className="nav-name" dir="ltr">Feedback-center</span>
          </Link>
          <nav className="nav-links" aria-label="مسیرهای اصلی">
            <a className="nav-link" href="#account">حساب کاربری</a>
            <Link className="nav-link solid" href="/admin/login">پنل مدیریت</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="hero">
        <section className="hero-copy" aria-labelledby="site-title">
          <p className="eyebrow">مرکز بازخورد</p>
          <h1 id="site-title" className="title" dir="ltr">
            Feedback<span className="title-accent">-center</span>
          </h1>
          <p className="lede">
            جایی ساده برای شنیدن نظر کاربران. با موبایل، ایمیل یا حساب گوگل وارد شو و
            پروفایلت را در چند ثانیه کامل کن.
          </p>
          <ul className="checklist">
            <li>ورود بدون رمز با کد یک‌بارمصرف پیامکی</li>
            <li>ورود سریع با ایمیل یا حساب گوگل</li>
            <li>پروفایل کوتاه، قابل ویرایش و بدون حواشی</li>
          </ul>
        </section>

        <section id="account" className="entry" aria-label="حساب کاربری">
          {profile && (session || clerkUser) ? (
            <div className="card">
              <p className="eyebrow">حساب کاربری</p>
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
            </div>
          ) : (
            <div className="card entry-card">
              <p className="eyebrow">ورود</p>
              <h2 className="card-title">به حساب خودت برگرد</h2>
              <p className="card-note">
                شماره موبایلت را وارد کن تا کد ورود برایت پیامک شود، یا با ایمیل و
                حساب گوگل وارد شو.
              </p>
              <AuthFlow status={status} phone={session?.phone} codeLength={OTP_LENGTH} />
              <p className="entry-foot">
                با ورود، پروفایلت ساخته می‌شود و هر وقت بخواهی می‌توانی آن را کامل کنی.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <span dir="ltr">Feedback-center</span>
        <span>نسخه ۱٫۰٫۰</span>
      </footer>
    </div>
  );
}
