import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/app/components/feedback/markdown";
import StatusChip from "@/app/components/feedback/status-chip";
import { getChangelogEntry } from "@/lib/feedback/changelog";
import { CATEGORY_LABELS, faDate } from "@/lib/feedback/labels";

export const metadata: Metadata = {
  title: "ورودی تغییرات | وسا",
};

export default async function ChangelogEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getChangelogEntry(id);
  if (!entry) notFound();

  return (
    <div className="fb-detail">
      <Link href="/changelog" className="fb-back">
        <span aria-hidden="true">←</span>
        همه تغییرات
      </Link>

      <article className="fb-entry" style={{ marginTop: 0 }}>
        <p className="fb-entry-date">{faDate(entry.publishedAt)}</p>
        <h1 className="fb-entry-title" style={{ fontSize: "1.5rem" }}>
          {entry.title}
        </h1>
        <Markdown source={entry.body} />

        {entry.posts.length > 0 ? (
          <>
            <h2 className="label" style={{ marginTop: 22 }}>
              بازخوردهایی که این تغییر حل کرد
            </h2>
            <div className="fb-linked">
              {entry.posts.map((post) => (
                <Link key={post.id} href={`/p/${post.id}`}>
                  {post.category ? `${CATEGORY_LABELS[post.category]} · ` : ""}
                  {post.title}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="field-hint" style={{ marginTop: 16 }}>
            این ورودی به بازخوردی وصل نشده است.
          </p>
        )}
      </article>

      <div className="fb-detail-foot">
        <StatusChip status="shipped" label="منتشر شده" />
        <Link href="/feed" className="fb-btn fb-btn-ghost">
          بازگشت به فید
        </Link>
      </div>
    </div>
  );
}
