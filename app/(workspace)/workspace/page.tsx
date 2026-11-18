import Link from "next/link";
import StatusChip from "@/app/components/feedback/status-chip";
import { getCompanyStats } from "@/lib/companies";
import { listChangelog } from "@/lib/feedback/changelog";
import { formatDate, formatNumber } from "@/lib/feedback/labels";
import { listFeed } from "@/lib/feedback/posts";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { getWorkspaceContext } from "@/lib/workspace";

const ROLE_LABELS: Record<string, [string, string]> = {
  owner: ["مالک", "owner"],
  admin: ["مدیر", "admin"],
  member: ["عضو", "member"],
};

export default async function WorkspaceOverviewPage() {
  const context = await getWorkspaceContext();
  if (!context) return null;
  const { company, role } = context;
  const locale = await getLocale();
  const t = translator(locale);

  const [stats, latest, top, updates] = await Promise.all([
    getCompanyStats(company.id),
    listFeed({ companyId: company.id, limit: 6 }),
    listFeed({ companyId: company.id, limit: 5, sort: "votes" }),
    listChangelog(3, company.id),
  ]);

  const roleText = ROLE_LABELS[role];
  const roleLabel = roleText ? t(roleText[0], roleText[1]) : role;

  return (
    <>
      <header className="wk-head">
        <div>
          <h1>{t(`${company.name} در یک نگاه`, `${company.name} overview`)}</h1>
          <p>
            {t(
              `ببین مشتری‌ها چی می‌خوان، نقشه راه رو به‌روز نگه دار و وقتی چیزی منتشر شد به همه بگو. با نقش ${roleLabel} وارد شدی.`,
              `See what customers ask for, keep the roadmap current, and tell everyone when something ships. Signed in as ${roleLabel}.`,
            )}
          </p>
        </div>
        <div className="wk-head-actions">
          <Link href={`/c/${company.slug}`} className="bd-btn">
            {t("دیدن برد عمومی", "View public board")}
          </Link>
          <Link href="/workspace/feedback" className="bd-btn bd-btn-primary">
            {t("بررسی فیدبک‌ها", "Triage feedback")}
          </Link>
        </div>
      </header>

      <section className="wk-stats" aria-label={t("آمار شرکت", "Company stats")}>
        <div className="wk-stat">
          <span>{t("فیدبک", "Feedback")}</span>
          <strong>{formatNumber(stats.total, locale)}</strong>
        </div>
        <div className="wk-stat">
          <span>{t("رأی‌ها", "Votes")}</span>
          <strong>{formatNumber(stats.votes, locale)}</strong>
        </div>
        <div className="wk-stat">
          <span>{t("در انتظار بررسی", "Awaiting review")}</span>
          <strong>{formatNumber(stats.fresh, locale)}</strong>
        </div>
        <div className="wk-stat">
          <span>{t("در حال انجام", "In progress")}</span>
          <strong>{formatNumber(stats.inProgress, locale)}</strong>
        </div>
        <div className="wk-stat">
          <span>{t("منتشر شده", "Shipped")}</span>
          <strong>{formatNumber(stats.shipped, locale)}</strong>
        </div>
      </section>

      <div className="wk-grid-2">
        <section className="wk-panel" aria-labelledby="wk-latest-title">
          <div className="wk-panel-head">
            <h2 id="wk-latest-title">{t("آخرین فیدبک‌ها", "Latest feedback")}</h2>
            <Link href="/workspace/feedback">{t("همه فیدبک‌ها", "All feedback")}</Link>
          </div>
          <div className="wk-panel-body">
            {latest.length === 0 ? (
              <p className="wk-empty">
                {t(
                  "هنوز چیزی نیست. بردت رو به اشتراک بذار تا اولین ایده‌ها همین‌جا بیاد.",
                  "Nothing yet. Share your board and the first ideas will land here.",
                )}
              </p>
            ) : (
              <ul className="wk-list">
                {latest.map((post) => (
                  <li key={post.id}>
                    <StatusChip status={post.status} locale={locale} />
                    <Link href={`/c/${company.slug}/p/${post.id}`}>{post.title}</Link>
                    <span className="wk-num">{formatNumber(post.upvotes, locale)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="wk-panel" aria-labelledby="wk-top-title">
          <div className="wk-panel-head">
            <h2 id="wk-top-title">{t("بیشترین رأی", "Most voted")}</h2>
            <Link href="/workspace/roadmap">{t("نقشه راه", "Roadmap")}</Link>
          </div>
          <div className="wk-panel-body">
            {top.length === 0 ? (
              <p className="wk-empty">{t("هنوز رأیی نیامده.", "No votes yet.")}</p>
            ) : (
              <ol className="wk-list">
                {top.map((post) => (
                  <li key={post.id}>
                    <Link href={`/c/${company.slug}/p/${post.id}`}>{post.title}</Link>
                    <span className="wk-num">{formatNumber(post.upvotes, locale)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>

      <section className="wk-panel" style={{ marginTop: 22 }} aria-labelledby="wk-updates-title">
        <div className="wk-panel-head">
          <h2 id="wk-updates-title">{t("تغییرات اخیر", "Recent updates")}</h2>
          <Link href="/workspace/updates">{t("مدیریت تغییرات", "Manage updates")}</Link>
        </div>
        <div className="wk-panel-body">
          {updates.length === 0 ? (
            <p className="wk-empty">
              {t(
                "هنوز چیزی منتشر نشده. یه چیز رو منتشر کن و به مشتری‌هات خبر بده.",
                "Nothing published yet. Ship something and tell your customers.",
              )}
            </p>
          ) : (
            <ul className="wk-list">
              {updates.map((entry) => (
                <li key={entry.id}>
                  <Link href={`/c/${company.slug}/updates`}>{entry.title}</Link>
                  <span className="wk-num">{formatDate(entry.publishedAt, locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
