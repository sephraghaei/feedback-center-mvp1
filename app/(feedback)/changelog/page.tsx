import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import ComposerButton from "@/app/components/feedback/composer-button";
import Markdown from "@/app/components/feedback/markdown";
import WipBadge from "@/app/components/feedback/wip-badge";
import { faDate } from "@/lib/feedback/labels";
import { listChangelog } from "@/lib/feedback/changelog";

export const metadata: Metadata = {
  title: "تغییرات | وسا",
  description: "هر تغییری که منتشر می‌شه، با فید‌بک‌هایی که باعثش شدن.",
};

export default async function ChangelogPage() {
  const entries = await listChangelog();

  return (
    <>
      <section className="fb-hero fb-page-head">
        <p className="fb-eyebrow">
          <BrandMark className="eyebrow-mark" simple />
          تغییرات{" "}
          <WipBadge />
        </p>
        <h1 className="fb-title">هر چیزی که منتشر شد</h1>
        <p className="fb-lede">
          هر تغییری که منتشر می‌شه، با فید‌بک‌هایی که باعثش شدن. مسیر از ایده تا انتشار شفاف
          می‌مونه.
        </p>
        <div className="fb-hero-actions">
          <ComposerButton className="fb-btn fb-btn-primary">فید‌بک بده</ComposerButton>
          <Link href="/feed" className="fb-btn fb-btn-ghost">
            همه فید‌بک‌ها
          </Link>
        </div>
      </section>

      {entries.length > 0 ? (
        <div className="fb-changelog">
          {entries.map((entry) => (
            <article key={entry.id} className="fb-entry" data-spotlight>
              <p className="fb-entry-date">{faDate(entry.publishedAt)}</p>
              <h2 className="fb-entry-title">
                <Link href={`/changelog/${entry.id}`}>{entry.title}</Link>
              </h2>
              <Markdown source={entry.body} />
              <p className="field-hint fb-entry-more">
                <Link href={`/changelog/${entry.id}`} className="fb-link">
                  فید‌بک‌های مرتبط
                </Link>
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="fb-empty">
          <strong>هنوز تغییری منتشر نشده.</strong>
          وقتی اولین تغییر منتشر بشه، همین‌جا با فید‌بک‌های مرتبطش میاد.
        </div>
      )}
    </>
  );
}
