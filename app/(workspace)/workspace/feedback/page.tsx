import Link from "next/link";
import FeedbackKindBadge from "@/app/components/feedback/kind-badge";
import { workspaceStatusAction } from "@/app/(workspace)/actions";
import { formatDate, formatNumber, isFeedbackKind, statusLabel } from "@/lib/feedback/labels";
import { listFeed } from "@/lib/feedback/posts";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { getWorkspaceContext } from "@/lib/workspace";

const FILTERS = ["", "new", "planned", "in_progress", "shipped"] as const;
const QUICK_STATUSES = ["new", "planned", "in_progress", "shipped"] as const;

export default async function WorkspaceFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const context = await getWorkspaceContext("/workspace/feedback");
  if (!context) return null;
  const { company } = context;

  const locale = await getLocale();
  const t = translator(locale);
  const { status = "" } = await searchParams;
  const active = FILTERS.some((entry) => entry === status && entry) ? status : "";

  const posts = await listFeed({
    companyId: company.id,
    status: active || undefined,
    sort: "votes",
    limit: 200,
  });

  const back = active ? `/workspace/feedback?status=${active}` : "/workspace/feedback";

  return (
    <>
      <header className="wk-head">
        <div>
          <h1>{t("فیدبک", "Feedback")}</h1>
          <p>
            {t(
              "هر ایده‌ای که مشتری‌ها بهش رأی دادن. همون‌جوری که تیم متعهد شد کارت رو جلو ببر؛ مشتری‌ها تغییر رو بلافاصله می‌بینن.",
              "Every idea customers voted on. Move a card forward as soon as the team commits to it, and customers see the change right away.",
            )}
          </p>
        </div>
      </header>

      <nav className="wk-filters" aria-label={t("فیلتر بر اساس وضعیت", "Filter by status")}>
        {FILTERS.map((entry) => (
          <Link
            key={entry || "all"}
            href={entry ? `/workspace/feedback?status=${entry}` : "/workspace/feedback"}
            className={active === entry ? "active" : ""}
          >
            {entry ? statusLabel(entry, locale) : t("همه", "All")}
          </Link>
        ))}
      </nav>

      <div className="wk-table-wrap">
        {posts.length === 0 ? (
          <div className="wk-empty">
            <strong>{t("فیدبکی اینجا نیست", "No feedback here")}</strong>
            {t("هنوز هیچی با این فیلتر جور درنمیاد.", "Nothing matches this filter yet.")}
          </div>
        ) : (
          <div className="wk-table-scroll">
            <table className="wk-table wk-feedback-table">
              <thead>
                <tr>
                  <th scope="col">{t("فیدبک", "Feedback")}</th>
                  <th scope="col">{t("رأی‌ها", "Votes")}</th>
                  <th scope="col">{t("کامنت‌ها", "Comments")}</th>
                  <th scope="col">{t("تاریخ", "Created")}</th>
                  <th scope="col">{t("وضعیت", "Status")}</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/c/${company.slug}/p/${post.id}`}>{post.title}</Link>
                      <span className="wk-row-sub">
                        {post.authorName ?? t("کاربر", "Member")}
                        {post.category && isFeedbackKind(post.category) ? (
                          <>
                            {" · "}
                            <FeedbackKindBadge kind={post.category} locale={locale} />
                          </>
                        ) : null}
                      </span>
                    </td>
                    <td className="wk-votes" data-label={t("رأی‌ها", "Votes")}>
                      {formatNumber(post.upvotes, locale)}
                    </td>
                    <td className="wk-votes" data-label={t("کامنت‌ها", "Comments")}>
                      {formatNumber(post.commentCount, locale)}
                    </td>
                    <td className="wk-votes" data-label={t("تاریخ", "Created")}>
                      {formatDate(post.createdAt, locale)}
                    </td>
                    <td>
                      <form action={workspaceStatusAction} className="wk-status-form">
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="hidden" name="back" value={back} />
                        {QUICK_STATUSES.map((value) => {
                          const current = post.status === value;
                          return (
                            <button
                              key={value}
                              type="submit"
                              name="status"
                              value={value}
                              className={`wk-chip-btn${current ? " current" : ""}`}
                              disabled={current}
                              aria-current={current ? "true" : undefined}
                            >
                              {statusLabel(value, locale)}
                            </button>
                          );
                        })}
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="wk-hint" style={{ marginTop: 12 }}>
        {t(
          "تغییر وضعیت عمومیه. مشتری‌ها همون وضعیت رو توی برد و حسابشون می‌بینن.",
          "Status changes are public. Customers get the same status on the board and in their account.",
        )}
      </p>
    </>
  );
}
