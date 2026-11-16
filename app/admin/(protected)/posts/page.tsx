import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../../components/bits";
import PostAdminActions from "../../components/post-admin-actions";
import { STATUS_LABELS, faDate, faNumber } from "@/lib/feedback/labels";
import { listFeedbackForAdmin } from "@/lib/feedback/posts";
import { toPersianDigits } from "@/lib/phone";

export const metadata: Metadata = { title: "مدیریت فید‌بک‌ها | وسا" };

export default async function AdminPostsPage() {
  const posts = await listFeedbackForAdmin();
  const hidden = posts.filter((post) => post.hidden).length;

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">مدیریت فید‌بک‌ها</h1>
          <span className="count-badge">{toPersianDigits(String(posts.length))}</span>
        </div>
        <p className="page-sub">
          جابه‌جایی روی نقشه راه، پنهان کردن یا حذف. وضعیت هر فید‌بک همان ستون نقشه راه است.
          {hidden > 0 ? ` ${toPersianDigits(String(hidden))} مورد پنهان شده است.` : ""}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <Icon name="list" size={26} />
          <h3>هنوز فید‌بک‌ی ثبت نشده.</h3>
          <p>اولین فید‌بک محصول که کاربران بنویسند، همین‌جا برای مدیریت ظاهر می‌شود.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>فید‌بک</th>
                <th style={{ width: "12%" }}>وضعیت</th>
                <th style={{ width: "8%" }}>رای</th>
                <th style={{ width: "14%" }}>تاریخ</th>
                <th style={{ width: "26%" }}>اقدامات</th>
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
                      <span className="post-sub">{post.authorName ?? "کاربر"}</span>
                      {post.product ? (
                        <span className="post-sub" dir="auto">
                          محصول یا سایت: {post.product}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <span className="badge">{STATUS_LABELS[post.status] ?? post.status}</span>
                    {post.hidden ? <span className="pill warn" style={{ marginInlineStart: 6 }}>پنهان</span> : null}
                  </td>
                  <td className="cell-id">{faNumber(post.upvotes)}</td>
                  <td className="cell-date">{faDate(post.createdAt)}</td>
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
