import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../../components/bits";
import ChangelogForm from "../../components/changelog-form";
import { resolveableFeedback, listChangelog } from "@/lib/feedback/changelog";
import { faDate } from "@/lib/feedback/labels";

export const metadata: Metadata = { title: "تغییرات | وسا" };

export default async function AdminChangelogPage() {
  const [entries, candidates] = await Promise.all([listChangelog(50), resolveableFeedback()]);

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">تغییرات منتشر شده</h1>
          <span className="count-badge">{entries.length.toLocaleString("fa-IR")}</span>
        </div>
        <p className="page-sub">
          هر ورودی را با بازخوردهایی که حل کرده وصل کن. بعد از انتشار، آن بازخوردها خودکار
          «منتشر شده» می‌شوند و لینک ورودی رویشان می‌آید.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <section aria-labelledby="new-entry">
          <h2 id="new-entry" className="page-title" style={{ fontSize: "0.95rem", marginBottom: 10 }}>
            ورودی تازه
          </h2>
          <ChangelogForm candidates={candidates} />
        </section>

        <section aria-labelledby="entry-list">
          <h2 id="entry-list" className="page-title" style={{ fontSize: "0.95rem", marginBottom: 10 }}>
            ورودی‌های قبلی
          </h2>
          {entries.length === 0 ? (
            <div className="empty-state">
              <Icon name="calendar" size={26} />
              <h3>هنوز ورودی‌ای منتشر نشده.</h3>
              <p>اولین تغییر منتشر شده را از فرم بالا بنویس.</p>
            </div>
          ) : (
            <div className="list-view">
              {entries.map((entry) => (
                <div key={entry.id} className="list-row">
                  <div>
                    <span className="name">
                      <Link href={`/changelog/${entry.id}`} style={{ color: "inherit" }}>
                        {entry.title}
                      </Link>
                    </span>
                    <span className="meta">{faDate(entry.publishedAt)}</span>
                  </div>
                  <Link href={`/changelog/${entry.id}`} className="btn btn-ghost">
                    <Icon name="external" size={15} />
                    نمایش عمومی
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
