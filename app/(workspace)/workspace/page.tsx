import Link from "next/link";
import StatusChip from "@/app/components/feedback/status-chip";
import { getCompanyStats } from "@/lib/companies";
import { listChangelog } from "@/lib/feedback/changelog";
import { formatDate, formatNumber } from "@/lib/feedback/labels";
import { listFeed } from "@/lib/feedback/posts";
import { getWorkspaceContext } from "@/lib/workspace";

export default async function WorkspaceOverviewPage() {
  const context = await getWorkspaceContext();
  if (!context) return null;
  const { company, role } = context;

  const [stats, latest, top, updates] = await Promise.all([
    getCompanyStats(company.id),
    listFeed({ companyId: company.id, limit: 6 }),
    listFeed({ companyId: company.id, limit: 5, sort: "votes" }),
    listChangelog(3, company.id),
  ]);

  return (
    <>
      <header className="wk-head">
        <div>
          <h1>{company.name} overview</h1>
          <p>
            See what customers ask for, keep the roadmap current, and tell everyone when
            something ships. Signed in as {role}.
          </p>
        </div>
        <div className="wk-head-actions">
          <Link href={`/c/${company.slug}`} className="bd-btn">
            View public board
          </Link>
          <Link href="/workspace/feedback" className="bd-btn bd-btn-primary">
            Triage feedback
          </Link>
        </div>
      </header>

      <section className="wk-stats" aria-label="Company stats">
        <div className="wk-stat">
          <span>Feedback</span>
          <strong>{formatNumber(stats.total)}</strong>
        </div>
        <div className="wk-stat">
          <span>Votes</span>
          <strong>{formatNumber(stats.votes)}</strong>
        </div>
        <div className="wk-stat">
          <span>Awaiting review</span>
          <strong>{formatNumber(stats.fresh)}</strong>
        </div>
        <div className="wk-stat">
          <span>In progress</span>
          <strong>{formatNumber(stats.inProgress)}</strong>
        </div>
        <div className="wk-stat">
          <span>Shipped</span>
          <strong>{formatNumber(stats.shipped)}</strong>
        </div>
      </section>

      <div className="wk-grid-2">
        <section className="wk-panel" aria-labelledby="wk-latest-title">
          <div className="wk-panel-head">
            <h2 id="wk-latest-title">Latest feedback</h2>
            <Link href="/workspace/feedback">All feedback</Link>
          </div>
          <div className="wk-panel-body">
            {latest.length === 0 ? (
              <p className="wk-empty">Nothing yet. Share your board and the first ideas will land here.</p>
            ) : (
              <ul className="wk-list">
                {latest.map((post) => (
                  <li key={post.id}>
                    <StatusChip status={post.status} />
                    <Link href={`/c/${company.slug}/p/${post.id}`}>{post.title}</Link>
                    <span className="wk-num">{formatNumber(post.upvotes)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="wk-panel" aria-labelledby="wk-top-title">
          <div className="wk-panel-head">
            <h2 id="wk-top-title">Most voted</h2>
            <Link href="/workspace/roadmap">Roadmap</Link>
          </div>
          <div className="wk-panel-body">
            {top.length === 0 ? (
              <p className="wk-empty">No votes yet.</p>
            ) : (
              <ol className="wk-list">
                {top.map((post) => (
                  <li key={post.id}>
                    <Link href={`/c/${company.slug}/p/${post.id}`}>{post.title}</Link>
                    <span className="wk-num">{formatNumber(post.upvotes)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>

      <section className="wk-panel" style={{ marginTop: 22 }} aria-labelledby="wk-updates-title">
        <div className="wk-panel-head">
          <h2 id="wk-updates-title">Recent updates</h2>
          <Link href="/workspace/updates">Manage updates</Link>
        </div>
        <div className="wk-panel-body">
          {updates.length === 0 ? (
            <p className="wk-empty">Nothing published yet. Ship something and tell your customers.</p>
          ) : (
            <ul className="wk-list">
              {updates.map((entry) => (
                <li key={entry.id}>
                  <Link href={`/c/${company.slug}/updates`}>{entry.title}</Link>
                  <span className="wk-num">{formatDate(entry.publishedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
