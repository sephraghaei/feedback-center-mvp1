import type { Metadata } from "next";
import { Icon } from "../../components/bits";
import ChangelogForm from "../../components/changelog-form";
import { resolveableFeedback, listChangelog } from "@/lib/feedback/changelog";
import { formatDate } from "@/lib/feedback/labels";

export const metadata: Metadata = { title: "Updates | Vasa" };

export default async function AdminChangelogPage() {
  const [entries, candidates] = await Promise.all([listChangelog(50), resolveableFeedback()]);

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">Published updates</h1>
          <span className="count-badge">{entries.length.toLocaleString("en-US")}</span>
        </div>
        <p className="page-sub">
          Link each entry to the feedback it resolves. On publish, those feedback items move
          to Shipped and get a link to the entry.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <section aria-labelledby="new-entry">
          <h2 id="new-entry" className="page-title" style={{ fontSize: "0.95rem", marginBottom: 10 }}>
            New entry
          </h2>
          <ChangelogForm candidates={candidates} />
        </section>

        <section aria-labelledby="entry-list">
          <h2 id="entry-list" className="page-title" style={{ fontSize: "0.95rem", marginBottom: 10 }}>
            Previous entries
          </h2>
          {entries.length === 0 ? (
            <div className="empty-state">
              <Icon name="calendar" size={26} />
              <h3>No updates published yet.</h3>
              <p>Write the first update in the form above.</p>
            </div>
          ) : (
            <div className="list-view">
              {entries.map((entry) => (
                <div key={entry.id} className="list-row">
                  <div>
                    <span className="name">{entry.title}</span>
                    <span className="meta">{formatDate(entry.publishedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
