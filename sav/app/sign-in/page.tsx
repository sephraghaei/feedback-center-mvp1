import Link from "next/link";
import { redirect } from "next/navigation";
import { sendMagicLink } from "@/app/actions";
import { BrandMark, Icon } from "@/components/icons";
import Notice from "@/components/notice";
import { getViewer } from "@/lib/auth";
import { firstParam, safeNext } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = { title: "ورود | ساو" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const viewer = await getViewer();

  const next = safeNext(firstParam(params.next));
  if (viewer.user) redirect(next);

  const sent = firstParam(params.sent) === "1";
  const email = firstParam(params.email);
  const error = firstParam(params.error);

  return (
    <div className="page flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card overflow-hidden">
          <div
            className="px-6 py-8 sm:px-8"
            style={{
              background:
                "radial-gradient(420px 200px at 85% -20%, rgba(20,108,67,0.14), transparent 70%)",
            }}
          >
            <BrandMark size={42} />
            <h1 className="mt-4 text-2xl font-semibold text-ink">{t.authTitle}</h1>
            <p className="muted mt-2">{t.authSub}</p>
          </div>

          <div className="border-t border-line px-6 py-7 sm:px-8">
            {error ? (
              <div className="mb-5">
                <Notice error={error} t={t} />
              </div>
            ) : null}

            {sent ? (
              <div className="rounded-2xl border border-brand/20 bg-brand-soft px-4 py-5 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand">
                  <Icon name="mail" size={20} />
                </span>
                <p className="mt-3 text-base font-semibold text-brand-strong">{t.authCheckTitle}</p>
                <p className="mt-1.5 text-sm leading-7 text-ink-2" dir="auto">
                  {t.authCheckBody.replace("{email}", email || t.authEmailLabel)}
                </p>
              </div>
            ) : (
              <form action={sendMagicLink} className="flex flex-col gap-4">
                <input type="hidden" name="next" value={next} />
                <label className="field">
                  <span className="label">{t.authEmailLabel}</span>
                  <input
                    type="email"
                    name="email"
                    required
                    dir="ltr"
                    autoComplete="email"
                    defaultValue={email}
                    placeholder={t.authEmailPlaceholder}
                    className="input text-start"
                  />
                </label>
                <button type="submit" className="btn btn-primary w-full">
                  <Icon name="mail" size={16} />
                  {t.actionSendLink}
                </button>
                <p className="hint">{t.authNote}</p>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
              <Link href="/feed" className="inline-flex items-center gap-1.5 text-ink-2 hover:text-ink">
                <Icon name="arrow" size={14} className="flip" />
                {t.navFeed}
              </Link>
              <Link href="/search" className="text-ink-3 hover:text-ink">
                {t.navSearch}
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-ink-3">{t.feedGuestNote}</p>
      </div>
    </div>
  );
}
