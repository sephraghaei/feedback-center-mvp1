import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/app/components/feedback/markdown";
import { getCompanyBySlug } from "@/lib/companies";
import { listChangelog } from "@/lib/feedback/changelog";
import { formatDate } from "@/lib/feedback/labels";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [company, locale] = await Promise.all([getCompanyBySlug(slug), getLocale()]);
  const t = translator(locale);
  return {
    title: company
      ? t(`تغییرات ${company.name} | وسا`, `${company.name} updates | Vasa`)
      : t("تغییرات | وسا", "Updates | Vasa"),
  };
}

export default async function CompanyUpdatesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const locale = await getLocale();
  const t = translator(locale);
  const entries = await listChangelog(40, company.id);
  const base = `/c/${company.slug}`;

  return (
    <>
      <section className="bd-hero">
        <div>
          <h1>{t("تغییرات", "Updates")}</h1>
          <p>
            {t(
              `هر چیزی که ${company.name} منتشر کرده، از تازه‌ترین.`,
              `Everything ${company.name} has shipped, newest first.`,
            )}
          </p>
        </div>
        <div className="bd-hero-actions">
          <Link href={`${base}/new`} className="bd-submit">
            {t("ثبت فیدبک", "Submit feedback")}
          </Link>
        </div>
      </section>

      <div className="bd-updates">
        {entries.length === 0 ? (
          <div className="bd-empty">
            <strong>{t("هنوز تغییری منتشر نشده.", "No updates yet.")}</strong>
            <p>
              {t(
                `وقتی ${company.name} چیز تازه‌ای منتشر کنه، اول همین‌جا میاد.`,
                `When ${company.name} ships something new, it lands here first.`,
              )}
            </p>
            <Link href={base} className="bd-btn">
              {t("بازگشت به فیدبک", "Back to feedback")}
            </Link>
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="bd-update">
              <time className="bd-update-date" dateTime={entry.publishedAt.toISOString()}>
                {formatDate(entry.publishedAt, locale)}
              </time>
              <div>
                <h2>{entry.title}</h2>
                <Markdown source={entry.body} className="bd-update-body" />
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
