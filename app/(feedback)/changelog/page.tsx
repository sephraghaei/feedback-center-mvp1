import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import Markdown from "@/app/components/feedback/markdown";
import { faDate } from "@/lib/feedback/labels";
import { listChangelog } from "@/lib/feedback/changelog";

export const metadata: Metadata = {
  title: "تغییرات | وسا",
  description: "هر نسخه چه چیزی را حل کرد و کدام بازخوردها به انتشار رسیدند.",
};

export default async function ChangelogPage() {
  const entries = await listChangelog();

  return (
    <>
      <section className="fb-hero">
        <p className="fb-eyebrow">
          <BrandMark className="eyebrow-mark" simple />
          تغییرات
        </p>
        <h1 className="fb-title">آنچه ساخته شد، با تاریخ و پیوند</h1>
        <p className="fb-lede">
          هر ورودی تغییرات به بازخوردهایی وصل است که آن را حل کرده‌اند. این‌جا معلوم می‌شود حرف
          کاربران به کدام تغییر رسیده است.
        </p>
        <div className="fb-hero-actions">
          <Link href="/feed" className="fb-btn">
            فید بازخوردها
          </Link>
          <Link href="/roadmap" className="fb-btn fb-btn-ghost">
            نقشه راه
          </Link>
        </div>
      </section>

      {entries.length > 0 ? (
        entries.map((entry) => (
          <article key={entry.id} className="fb-entry" data-spotlight>
            <p className="fb-entry-date">{faDate(entry.publishedAt)}</p>
            <h2 className="fb-entry-title">
              <Link href={`/changelog/${entry.id}`}>{entry.title}</Link>
            </h2>
            <Markdown source={entry.body} />
            <p className="field-hint" style={{ marginTop: 12 }}>
              <Link href={`/changelog/${entry.id}`} className="fb-link">
                بازخوردهای مرتبط
              </Link>
            </p>
          </article>
        ))
      ) : (
        <div className="fb-empty" style={{ marginTop: 22 }}>
          <strong>هنوز ورودی تغییری منتشر نشده است.</strong>
          وقتی اولین تغییر منتشر شود، همین‌جا با پیوند به بازخوردهایش می‌آید.
        </div>
      )}
    </>
  );
}
