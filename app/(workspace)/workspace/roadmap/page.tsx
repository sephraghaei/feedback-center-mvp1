import Link from "next/link";
import FeedbackKindBadge from "@/app/components/feedback/kind-badge";
import { workspaceStatusAction } from "@/app/(workspace)/actions";
import { feedbackKind, formatNumber, statusLabel } from "@/lib/feedback/labels";
import { listFeed, listRoadmap } from "@/lib/feedback/posts";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { getWorkspaceContext } from "@/lib/workspace";

export default async function WorkspaceRoadmapPage() {
  const context = await getWorkspaceContext("/workspace/roadmap");
  if (!context) return null;
  const { company } = context;
  const base = `/c/${company.slug}`;

  const locale = await getLocale();
  const t = translator(locale);
  const columns = [
    { status: "planned", hint: t("متعهد شدیم، هنوز شروع نشده.", "Committed, not started yet.") },
    { status: "in_progress", hint: t("توی چرخه فعلی.", "In the current cycle.") },
    { status: "shipped", hint: t("برای مشتری‌ها زنده شد.", "Live for customers.") },
  ] as const;

  const [posts, fresh] = await Promise.all([
    listRoadmap({ companyId: company.id }),
    listFeed({ companyId: company.id, status: "new", sort: "votes", limit: 8 }),
  ]);

  return (
    <>
      <header className="wk-head">
        <div>
          <h1>{t("نقشه راه", "Roadmap")}</h1>
          <p>
            {t(
              "تصمیم بگیر بعدی چیه. هر چیزی که از وضعیت جدید بیرون بیاری، همون لحظه توی نقشه راه عمومی دیده می‌شه.",
              "Decide what comes next. Anything you move out of New shows up on the public roadmap immediately.",
            )}
          </p>
        </div>
        <div className="wk-head-actions">
          <Link href={`${base}/roadmap`} className="bd-btn">
            {t("دیدن نقشه راه عمومی", "View public roadmap")}
          </Link>
        </div>
      </header>

      <section className="wk-panel" aria-labelledby="wk-triage-title">
        <div className="wk-panel-head">
          <h2 id="wk-triage-title">{t("نیاز به بررسی", "Needs triage")}</h2>
          <Link href="/workspace/feedback?status=new">{t("همه فیدبک‌های جدید", "All new feedback")}</Link>
        </div>
        <div className="wk-panel-body">
          {fresh.length === 0 ? (
            <p className="wk-empty">
              {t("چیزی در انتظار نیست. همه وضعیت دارن.", "Nothing waiting. Everything has a status.")}
            </p>
          ) : (
            <ul className="wk-list">
              {fresh.map((post) => (
                <li key={post.id}>
                  <Link href={`${base}/p/${post.id}`}>{post.title}</Link>
                  <span className="wk-num">{formatNumber(post.upvotes, locale)}</span>
                  <form action={workspaceStatusAction} className="wk-status-form">
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="back" value="/workspace/roadmap" />
                    <button type="submit" name="status" value="planned" className="wk-chip-btn">
                      {t("برنامه‌ریزی", "Plan")}
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="in_progress"
                      className="wk-chip-btn"
                    >
                      {t("شروع", "Start")}
                    </button>
                    <button type="submit" name="status" value="shipped" className="wk-chip-btn">
                      {t("منتشر کن", "Ship")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="bd-cols">
        {columns.map((column) => {
          const items = posts.filter((post) => post.status === column.status);
          return (
            <section key={column.status} className="bd-col" data-status={column.status}>
              <div className="bd-col-head">
                <span className="bd-col-dot" aria-hidden="true" />
                <h2>{statusLabel(column.status, locale)}</h2>
                <span className="bd-col-count">{formatNumber(items.length, locale)}</span>
              </div>
              <p className="bd-helpful-sub" style={{ margin: "10px 2px 0" }}>
                {column.hint}
              </p>
              {items.length === 0 ? (
                <p className="bd-col-empty">{t("هنوز چیزی اینجا نیست.", "Nothing here yet.")}</p>
              ) : (
                <ul className="bd-col-list">
                  {items.map((post) => {
                    const kind = feedbackKind(post.type, post.category);
                    return (
                      <li key={post.id}>
                        <Link href={`${base}/p/${post.id}`} className="bd-col-card">
                          <strong>{post.title}</strong>
                          <span className="bd-col-card-foot">
                            {kind ? <FeedbackKindBadge kind={kind} locale={locale} /> : null}
                            <span style={{ marginInlineStart: "auto" }}>
                              {t(
                                `${formatNumber(post.upvotes, locale)} رأی`,
                                `${formatNumber(post.upvotes, locale)} votes`,
                              )}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
