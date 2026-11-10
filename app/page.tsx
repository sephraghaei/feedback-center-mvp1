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

const STACK = ["Next.js", "Vercel", "Supabase", "Clerk", "Resend"];

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
  const cta = status === "ready" ? "حساب کاربری" : status === "needs-profile" ? "تکمیل پروفایل" : "ورود یا ثبت‌نام";

  logger.info("page.home.view", {
    context: {
      status,
      authMethod: session ? session.method : clerkId ? "clerk" : "none",
      ...(session ? { userRef: userRef(session.phone ?? session.email) } : {}),
    },
  });

  return (
    <div className="shell">
      <div className="top-strip" aria-hidden="true" />

      <header className="site-nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand" aria-label="Feedback-center">
            <span className="brand-triangle" aria-hidden="true" />
            <span className="nav-name" dir="ltr">Feedback-center</span>
          </Link>
          <nav className="nav-links" aria-label="مسیرهای اصلی">
            <a className="nav-link" href="#account">حساب کاربری</a>
            <Link className="nav-link solid" href="/admin/login">پنل مدیریت</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="home">
        <section className="hero" aria-labelledby="site-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true" />
              مرکز بازخورد
            </p>
            <h1 id="site-title" className="title">بازخورد کاربران را ساده بشنو.</h1>
            <p className="lede">
              جایی ساده برای شنیدن نظر کاربران. با موبایل، ایمیل یا حساب گوگل وارد شو و
              پروفایلت را در چند ثانیه کامل کن.
            </p>

            <div className="hero-actions">
              <a className="primary" href="#account">{cta}</a>
              <Link className="ghost" href="/admin/login">پنل مدیریت</Link>
            </div>

            <ul className="hero-facts">
              <li>بدون رمز عبور</li>
              <li>پیامک یا ایمیل</li>
              <li>پروفایل کوتاه</li>
            </ul>
          </div>

          <div className="hero-glyph" aria-hidden="true">
            <span className="hero-triangle" />
          </div>

          <div className="hero-terminal" aria-hidden="true">
            <div className="terminal">
              <div className="terminal-head">
                <span className="terminal-dot" />
                <span className="terminal-name" dir="ltr">feedback-center</span>
                <span className="terminal-tag" dir="ltr">v1.0.0</span>
              </div>
              <div className="terminal-body">
                <p className="term-line">
                  <span className="term-sigil">▲</span>
                  ورود با شماره{" "}
                  <code className="term-code" dir="ltr">0912 *** 4567</code>
                </p>
                <p className="term-line ok">
                  <span className="term-sigil">✓</span>
                  کد یک‌بارمصرف تایید شد
                </p>
                <p className="term-line">
                  <span className="term-sigil">▲</span>
                  ساخت پروفایل{" "}
                  <code className="term-code" dir="ltr">--name sepehr</code>
                </p>
                <p className="term-line ok">
                  <span className="term-sigil">✓</span>
                  حساب آماده است
                </p>
                <p className="term-line term-meta" dir="ltr">
                  ready in 1.8s<span className="caret" />
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="trust" aria-label="ساخته شده روی">
          <p className="trust-label">ساخته شده روی</p>
          <ul className="trust-list">
            {STACK.map((name) => (
              <li key={name} dir="ltr">{name}</li>
            ))}
          </ul>
        </section>

        <section id="account" className="account" aria-labelledby="account-title">
          <div className="section-head account-head">
            <p className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true" />
              ورود
            </p>
            <h2 id="account-title" className="section-title">حساب خودت را بساز</h2>
            <p className="section-sub">
              یک مسیر روشن، بدون رمز عبور و بدون فرم طولانی. بقیه پروفایل هر وقت خواستی
              کامل می‌شود.
            </p>
          </div>

          <div className="account-body">
            {profile && (session || clerkUser) ? (
              <div className="card account-card">
                <p className="eyebrow">
                  <span className="eyebrow-mark" aria-hidden="true" />
                  حساب کاربری
                </p>
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
              <div className="card account-card entry-card">
                <p className="eyebrow">
                  <span className="eyebrow-mark" aria-hidden="true" />
                  ورود
                </p>
                <h3 className="card-title">به حساب خودت برگرد</h3>
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
          </div>
        </section>

        <section className="features" aria-labelledby="features-title">
          <div className="section-head">
            <p className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true" />
              امکانات
            </p>
            <h2 id="features-title" className="section-title">سه قدم تا یک حساب تمیز</h2>
            <p className="section-sub">هر قدم کوتاه است و معلوم.</p>
          </div>

          <div className="feature-grid">
            <article className="feature">
              <span className="feature-index">01</span>
              <h3 className="feature-title">ورود بدون رمز</h3>
              <p className="feature-body">
                کد یک‌بارمصرف پیامکی، بدون رمز عبور و بدون چیزی که باید حفظ کنی.
              </p>
              <span className="feature-code">▲ otp send</span>
            </article>

            <article className="feature feature-inverted">
              <span className="feature-index">02</span>
              <h3 className="feature-title">ایمیل یا گوگل</h3>
              <p className="feature-body">
                با حسابی که همین حالا داری در چند ثانیه وارد شو و همان اول کار جلو برو.
              </p>
              <span className="feature-code">✓ social auth</span>
            </article>

            <article className="feature">
              <span className="feature-index">03</span>
              <h3 className="feature-title">پروفایل کوتاه</h3>
              <p className="feature-body">
                چند فیلد روشن و قابل ویرایش، بدون حواشی و بدون فرم‌های طولانی.
              </p>
              <span className="feature-code">✓ profile edit</span>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span className="footer-brand">
          <span className="footer-triangle" aria-hidden="true" />
          <span dir="ltr">Feedback-center</span>
        </span>
        <span>نسخه ۱٫۰٫۰</span>
      </footer>
    </div>
  );
}
