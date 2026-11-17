import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/app/components/feedback/markdown";
import StatusChip from "@/app/components/feedback/status-chip";
import { getChangelogEntry } from "@/lib/feedback/changelog";
import { faDate } from "@/lib/feedback/labels";

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

      <article className="fb-entry fb-changelog-entry">
        <p className="fb-entry-date">{faDate(entry.publishedAt)}</p>
        <h1 className="fb-entry-title">{entry.title}</h1>
        <Markdown source={entry.body} />

        {entry.posts.length > 0 ? (
          <>
            <h2 className="label fb-changelog-block">
              فید‌بک‌هایی که این تغییر حل کرد
            </h2>
            <div className="fb-linked">
              {entry.posts.map((post) => (
                <Link key={post.id} href={`/p/${post.id}`}>
                  {post.title}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="field-hint fb-changelog-hint">
            این ورودی به فید‌بک‌ی وصل نشده.
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
