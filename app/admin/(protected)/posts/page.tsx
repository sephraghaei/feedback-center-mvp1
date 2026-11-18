import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../../components/bits";
import PostAdminActions from "../../components/post-admin-actions";
import { formatDate, formatNumber, statusLabel } from "@/lib/feedback/labels";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { listFeedbackForAdmin } from "@/lib/feedback/posts";

export async function generateMetadata(): Promise<Metadata> {
  const t = translator(await getLocale());
  return { title: t("مدیریت فیدبک‌ها | وسا", "Feedback | Vasa") };
}

export default async function AdminPostsPage() {
  const posts = await listFeedbackForAdmin();
  const hidden = posts.filter((post) => post.hidden).length;
  const locale = await getLocale();
  const t = translator(locale);

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">{t("مدیریت فیدبک‌ها", "Feedback")}</h1>
          <span className="count-badge">{formatNumber(posts.length, locale)}</span>
        </div>
        <p className="page-sub">
          {t(
            "جابه‌جایی روی نقشه راه، پنهان کردن یا حذف. وضعیت هر فیدبک همان ستون نقشه راه است.",
            "Move it on the roadmap, hide it or delete it. A feedback status is its roadmap column.",
          )}
          {hidden > 0
            ? t(` ${formatNumber(hidden, locale)} مورد پنهان شده است.`, ` ${formatNumber(hidden, locale)} hidden.`)
            : ""}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <Icon name="list" size={26} />
          <h3>{t("هنوز فیدبکی ثبت نشده.", "No feedback yet.")}</h3>
          <p>
            {t(
              "اولین فیدبک محصول که کاربران بنویسند، همین‌جا برای مدیریت ظاهر می‌شود.",
              "The first feedback users write shows up here for you to manage.",
            )}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>{t("فیدبک", "Feedback")}</th>
                <th style={{ width: "12%" }}>{t("وضعیت", "Status")}</th>
                <th style={{ width: "8%" }}>{t("رأی", "Votes")}</th>
                <th style={{ width: "14%" }}>{t("تاریخ", "Date")}</th>
                <th style={{ width: "26%" }}>{t("اقدامات", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="post-cell">
                      <span className="post-title">
                        <Link href={`/p/${post.id}`} style={{ color: "inherit" }}>
                          {post.title}
                        </Link>
                      </span>
                      <span className="post-sub">{post.authorName ?? t("کاربر", "Member")}</span>
                      {post.product ? (
                        <span className="post-sub" dir="auto">
                          {t(`محصول یا سایت: ${post.product}`, `Product: ${post.product}`)}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <span className="badge">{statusLabel(post.status, locale)}</span>
                    {post.hidden ? (
                      <span className="pill warn" style={{ marginInlineStart: 6 }}>
                        {t("پنهان", "Hidden")}
                      </span>
                    ) : null}
                  </td>
                  <td className="cell-id">{formatNumber(post.upvotes, locale)}</td>
                  <td className="cell-date">{formatDate(post.createdAt, locale)}</td>
                  <td>
                    <PostAdminActions postId={post.id} status={post.status} hidden={post.hidden} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
