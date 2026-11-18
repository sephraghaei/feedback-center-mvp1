import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../../components/bits";
import PostAdminActions from "../../components/post-admin-actions";
import { STATUS_LABELS, formatDate, formatNumber } from "@/lib/feedback/labels";
import { listFeedbackForAdmin } from "@/lib/feedback/posts";

export const metadata: Metadata = { title: "Feedback | Vasa" };

export default async function AdminPostsPage() {
  const posts = await listFeedbackForAdmin();
  const hidden = posts.filter((post) => post.hidden).length;

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">Feedback</h1>
          <span className="count-badge">{posts.length}</span>
        </div>
        <p className="page-sub">
          Move it on the roadmap, hide it or delete it. A feedback status is its roadmap column.
          {hidden > 0 ? ` ${hidden} hidden.` : ""}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <Icon name="list" size={26} />
          <h3>No feedback yet.</h3>
          <p>The first feedback users write shows up here for you to manage.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Feedback</th>
                <th style={{ width: "12%" }}>Status</th>
                <th style={{ width: "8%" }}>Votes</th>
                <th style={{ width: "14%" }}>Date</th>
                <th style={{ width: "26%" }}>Actions</th>
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
                      <span className="post-sub">{post.authorName ?? "Member"}</span>
                      {post.product ? (
                        <span className="post-sub" dir="auto">
                          Product: {post.product}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <span className="badge">{STATUS_LABELS[post.status] ?? post.status}</span>
                    {post.hidden ? <span className="pill warn" style={{ marginInlineStart: 6 }}>Hidden</span> : null}
                  </td>
                  <td className="cell-id">{formatNumber(post.upvotes)}</td>
                  <td className="cell-date">{formatDate(post.createdAt)}</td>
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
