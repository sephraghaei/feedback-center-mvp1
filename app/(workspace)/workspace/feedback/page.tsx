import Link from "next/link";
import FeedbackKindBadge from "@/app/components/feedback/kind-badge";
import { workspaceStatusAction } from "@/app/(workspace)/actions";
import {
  formatDate,
  formatNumber,
  isFeedbackKind,
  STATUS_LABELS,
} from "@/lib/feedback/labels";
import { listFeed } from "@/lib/feedback/posts";
import { getWorkspaceContext } from "@/lib/workspace";

const FILTERS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "shipped", label: "Shipped" },
];

const QUICK_STATUSES = ["new", "planned", "in_progress", "shipped"] as const;

export default async function WorkspaceFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const context = await getWorkspaceContext("/workspace/feedback");
  if (!context) return null;
  const { company } = context;

  const { status = "" } = await searchParams;
  const active = FILTERS.some((entry) => entry.value === status && entry.value) ? status : "";

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
          <h1>Feedback</h1>
          <p>
            Every idea customers voted on. Move a card forward as soon as the team commits to it,
            and customers see the change right away.
          </p>
        </div>
      </header>

      <nav className="wk-filters" aria-label="Filter by status">
        {FILTERS.map((entry) => (
          <Link
            key={entry.value || "all"}
            href={entry.value ? `/workspace/feedback?status=${entry.value}` : "/workspace/feedback"}
            className={active === entry.value ? "active" : ""}
          >
            {entry.label}
          </Link>
        ))}
      </nav>

      <div className="wk-table-wrap">
        {posts.length === 0 ? (
          <div className="wk-empty">
            <strong>No feedback here</strong>
            Nothing matches this filter yet.
          </div>
        ) : (
          <div className="wk-table-scroll">
            <table className="wk-table wk-feedback-table">
              <thead>
                <tr>
                  <th scope="col">Feedback</th>
                  <th scope="col">Votes</th>
                  <th scope="col">Comments</th>
                  <th scope="col">Created</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/c/${company.slug}/p/${post.id}`}>{post.title}</Link>
                      <span className="wk-row-sub">
                        {post.authorName ?? "Member"}
                        {post.category && isFeedbackKind(post.category) ? (
                          <>
                            {" · "}
                            <FeedbackKindBadge kind={post.category} />
                          </>
                        ) : null}
                      </span>
                    </td>
                    <td className="wk-votes" data-label="Votes">
                      {formatNumber(post.upvotes)}
                    </td>
                    <td className="wk-votes" data-label="Comments">
                      {formatNumber(post.commentCount)}
                    </td>
                    <td className="wk-votes" data-label="Created">
                      {formatDate(post.createdAt)}
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
                              {STATUS_LABELS[value]}
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
        Status changes are public. Customers get the same status on the board and in their
        account.
      </p>
    </>
  );
}
