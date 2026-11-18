import Link from "next/link";
import FeedbackKindBadge from "@/app/components/feedback/kind-badge";
import { workspaceStatusAction } from "@/app/(workspace)/actions";
import {
  feedbackKind,
  formatNumber,
  STATUS_LABELS,
} from "@/lib/feedback/labels";
import { listFeed, listRoadmap } from "@/lib/feedback/posts";
import { getWorkspaceContext } from "@/lib/workspace";

const COLUMNS = [
  { status: "planned", hint: "Committed, not started yet." },
  { status: "in_progress", hint: "In the current cycle." },
  { status: "shipped", hint: "Live for customers." },
] as const;

export default async function WorkspaceRoadmapPage() {
  const context = await getWorkspaceContext("/workspace/roadmap");
  if (!context) return null;
  const { company } = context;
  const base = `/c/${company.slug}`;

  const [posts, fresh] = await Promise.all([
    listRoadmap({ companyId: company.id }),
    listFeed({ companyId: company.id, status: "new", sort: "votes", limit: 8 }),
  ]);

  return (
    <>
      <header className="wk-head">
        <div>
          <h1>Roadmap</h1>
          <p>
            Decide what comes next. Anything you move out of New shows up on the public
            roadmap immediately.
          </p>
        </div>
        <div className="wk-head-actions">
          <Link href={`${base}/roadmap`} className="bd-btn">
            View public roadmap
          </Link>
        </div>
      </header>

      <section className="wk-panel" aria-labelledby="wk-triage-title">
        <div className="wk-panel-head">
          <h2 id="wk-triage-title">Needs triage</h2>
          <Link href="/workspace/feedback?status=new">All new feedback</Link>
        </div>
        <div className="wk-panel-body">
          {fresh.length === 0 ? (
            <p className="wk-empty">Nothing waiting. Everything has a status.</p>
          ) : (
            <ul className="wk-list">
              {fresh.map((post) => (
                <li key={post.id}>
                  <Link href={`${base}/p/${post.id}`}>{post.title}</Link>
                  <span className="wk-num">{formatNumber(post.upvotes)}</span>
                  <form action={workspaceStatusAction} className="wk-status-form">
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="back" value="/workspace/roadmap" />
                    <button type="submit" name="status" value="planned" className="wk-chip-btn">
                      Plan
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="in_progress"
                      className="wk-chip-btn"
                    >
                      Start
                    </button>
                    <button type="submit" name="status" value="shipped" className="wk-chip-btn">
                      Ship
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="bd-cols">
        {COLUMNS.map((column) => {
          const items = posts.filter((post) => post.status === column.status);
          return (
            <section key={column.status} className="bd-col" data-status={column.status}>
              <div className="bd-col-head">
                <span className="bd-col-dot" aria-hidden="true" />
                <h2>{STATUS_LABELS[column.status]}</h2>
                <span className="bd-col-count">{formatNumber(items.length)}</span>
              </div>
              <p className="bd-helpful-sub" style={{ margin: "10px 2px 0" }}>
                {column.hint}
              </p>
              {items.length === 0 ? (
                <p className="bd-col-empty">Nothing here yet.</p>
              ) : (
                <ul className="bd-col-list">
                  {items.map((post) => {
                    const kind = feedbackKind(post.type, post.category);
                    return (
                      <li key={post.id}>
                        <Link href={`${base}/p/${post.id}`} className="bd-col-card">
                          <strong>{post.title}</strong>
                          <span className="bd-col-card-foot">
                            {kind ? <FeedbackKindBadge kind={kind} /> : null}
                            <span style={{ marginInlineStart: "auto" }}>
                              {formatNumber(post.upvotes)} votes
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
