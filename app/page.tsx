import { cookies } from "next/headers";
import AuthFlow, { LogoutButton } from "./components/auth-flow";
import { OTP_LENGTH } from "@/lib/config";
import { logger } from "@/lib/logger";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import { toPersianDigits } from "@/lib/phone";
import { userRef } from "@/lib/user-ref";

export default async function Home() {
  const cookieStore = await cookies();
  const session = readSession(cookieStore.get(SESSION_COOKIE)?.value);
  const profile = session?.profile;
  const status = !session ? "guest" : profile ? "ready" : "needs-profile";

  logger.info("page.home.view", {
    context: {
      status,
      ...(session ? { userRef: userRef(session.phone) } : {}),
    },
  });

  return (
    <main className="page">
      <h1 className="title">Hello</h1>
      <p className="subtitle">خوش آمدید</p>

      {profile ? (
        <section className="card" aria-label="حساب کاربری">
          <p className="card-greeting">سلام، {profile.name} عزیز</p>
          <p className="card-note">خوشحالیم که اینجایی.</p>

          <dl className="details">
            <div className="detail">
              <dt>شماره موبایل</dt>
              <dd className="mono">{toPersianDigits(session.phone)}</dd>
            </div>
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

          <LogoutButton />
        </section>
      ) : (
        <AuthFlow status={status} phone={session?.phone} codeLength={OTP_LENGTH} />
      )}
    </main>
  );
}
