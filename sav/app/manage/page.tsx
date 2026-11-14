import Link from "next/link";
import { createBusiness } from "@/app/actions";
import Notice from "@/components/notice";
import { Icon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { firstParam, initials } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";
import { statusLabel, topicName, type Business, type Topic } from "@/lib/types";

export const metadata = { title: "پنل کسب‌وکار | ساو" };

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const viewer = await requireUser("/manage");
  const supabase = await createSupabaseServer();

  const ids = viewer.memberships.map((item) => item.business_id);
  const [businessResult, topicResult] = await Promise.all([
    ids.length > 0
      ? supabase.from("businesses").select("*").in("id", ids).order("created_at")
      : Promise.resolve({ data: [] as Business[] }),
    supabase.from("topics").select("id, slug, name_fa, name_en").order("slug"),
  ]);

  const businesses = (businessResult.data ?? []) as Business[];
  const topics = (topicResult.data ?? []) as Topic[];

  return (
    <div className="page">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t.navManage}</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{t.manageTitle}</h1>
          <p className="muted mt-2 max-w-xl">{t.manageSub}</p>
        </div>
      </header>

      <div className="mt-5">
        <Notice ok={firstParam(params.ok)} error={firstParam(params.error)} t={t} />
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-ink">{t.manageYourBusinesses}</h2>

        {businesses.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {businesses.map((business) => (
              <article key={business.id} className="card flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-2 text-base font-semibold text-brand">
                    {business.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={business.logo_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(business.name)
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-ink">{business.name}</h3>
                    <p className="mt-0.5 text-xs text-ink-3" dir="ltr">
                      /b/{business.slug}
                    </p>
                  </div>
                  <span
                    className={`chip ${
                      business.status === "active" ? "chip-normal" : "chip-important"
                    }`}
                  >
                    {statusLabel(t, business.status)}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-4">
                  <Link
                    href={`/manage/${business.id}`}
                    className="btn btn-soft btn-sm"
                  >
                    {t.actionEdit}
                    <Icon name="arrow" size={14} className="flip" />
                  </Link>
                  {business.status === "active" ? (
                    <Link
                      href={`/b/${business.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink"
                    >
                      <Icon name="external" size={13} />
                      {business.slug}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-2">{t.manageNoBusinesses}</p>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-ink">{t.manageCreateTitle}</h2>
          <p className="muted mt-1 max-w-2xl">{t.manageCreateSub}</p>
        </div>

        <form action={createBusiness} className="card grid gap-4 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span className="label">{t.manageName}</span>
              <input name="name" required className="input" />
            </label>
            <label className="field">
              <span className="label">{t.manageSlug}</span>
              <input
                name="slug"
                required
                className="input"
                dir="ltr"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="acme-studio"
              />
              <span className="hint">{t.manageSlugHint}</span>
            </label>
          </div>

          <label className="field">
            <span className="label">{t.manageDescription}</span>
            <textarea name="description" className="textarea min-h-24" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span className="label">{t.manageLogo}</span>
              <input name="logoUrl" className="input" dir="ltr" placeholder="https://" />
            </label>
            <label className="field">
              <span className="label">{t.manageContact}</span>
              <input name="contactEmail" type="email" className="input" dir="ltr" />
            </label>
            <label className="field">
              <span className="label">{t.manageWebsite}</span>
              <input name="websiteUrl" className="input" dir="ltr" placeholder="https://" />
            </label>
            <label className="field">
              <span className="label">{t.managePrimaryTopic}</span>
              <select name="primaryTopicId" className="select" defaultValue="">
                <option value="">{t.actionAll}</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topicName(topic, locale)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              <Icon name="plus" size={16} />
              {t.manageCreate}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
