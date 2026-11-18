import Link from "next/link";
import Markdown from "@/app/components/feedback/markdown";
import PublishUpdateForm from "@/app/components/workspace/publish-update-form";
import { canManageCompany } from "@/lib/companies";
import { listChangelog, resolveableFeedback } from "@/lib/feedback/changelog";
import { formatDate } from "@/lib/feedback/labels";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { getWorkspaceContext } from "@/lib/workspace";

export default async function WorkspaceUpdatesPage() {
  const context = await getWorkspaceContext("/workspace/updates");
  if (!context) return null;
  const { company, viewer, admin } = context;
  const locale = await getLocale();
  const t = translator(locale);

  const [entries, candidates, canPublish] = await Promise.all([
    listChangelog(40, company.id),
    resolveableFeedback(company.id),
    canManageCompany(company.id, viewer.userId, admin),
  ]);

  return (
    <>
      <header className="wk-head">
        <div>
          <h1>{t("تغییرات", "Updates")}</h1>
          <p>
            {t(
              "هر چی منتشر شد رو همین‌جا بنویس. مشتری‌ها توی برد می‌خوننش و فیدبکی که وصل کردی همون قدم به منتشر شده می‌ره.",
              "Publish what shipped. Customers read it on the board and the feedback you link moves to Shipped in the same step.",
            )}
          </p>
        </div>
        <div className="wk-head-actions">
          <Link href={`/c/${company.slug}/updates`} className="bd-btn">
            {t("دیدن تغییرات عمومی", "View public updates")}
          </Link>
        </div>
      </header>

      <div className="wk-grid-2">
        <section aria-labelledby="wk-new-update">
          <div className="wk-panel-head" style={{ paddingInline: 0 }}>
            <h2 id="wk-new-update">{t("تغییر جدید", "New update")}</h2>
          </div>
          {canPublish ? (
            <PublishUpdateForm candidates={candidates} />
          ) : (
            <p className="wk-empty">
              {t(
                "فقط مالک‌ها و مدیرهای شرکت می‌تونن تغییرات منتشر کنن.",
                "Only company owners and admins can publish updates.",
              )}
            </p>
          )}
        </section>

        <section className="wk-panel" aria-labelledby="wk-published">
          <div className="wk-panel-head">
            <h2 id="wk-published">{t("منتشر شده", "Published")}</h2>
            <span className="wk-num">{entries.length}</span>
          </div>
          <div className="wk-panel-body">
            {entries.length === 0 ? (
              <p className="wk-empty">{t("هنوز چیزی منتشر نشده.", "Nothing published yet.")}</p>
            ) : (
              <div style={{ display: "grid", gap: 18, paddingBlock: 14 }}>
                {entries.map((entry) => (
                  <article key={entry.id}>
                    <time className="wk-hint" dateTime={entry.publishedAt.toISOString()}>
                      {formatDate(entry.publishedAt, locale)}
                    </time>
                    <h3 style={{ margin: "4px 0 8px", fontSize: "0.95rem" }}>{entry.title}</h3>
                    <Markdown source={entry.body} className="bd-update-body" />
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
