import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeedbackKindBadge from "@/app/components/feedback/kind-badge";
import { VoteUpIcon } from "@/app/components/feedback/icons";
import { getCompanyBySlug } from "@/lib/companies";
import { formatNumber, feedbackKind, statusLabel } from "@/lib/feedback/labels";
import { listRoadmap } from "@/lib/feedback/posts";
import { getViewer } from "@/lib/feedback/viewer";
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
      ? t(`نقشه راه ${company.name} | وسا`, `${company.name} roadmap | Vasa`)
      : t("نقشه راه | وسا", "Roadmap | Vasa"),
  };
}

export default async function CompanyRoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const locale = await getLocale();
  const t = translator(locale);
  const columns = [
    { status: "planned", hint: t("مرحله بعدی نقشه راه.", "Next up on the roadmap.") },
    { status: "in_progress", hint: t("همین حالا داریم می‌سازیمش.", "Being built right now.") },
    { status: "shipped", hint: t("منتشر شده و در دسترسه.", "Live and in your hands.") },
  ] as const;

  const viewer = await getViewer();
  const posts = await listRoadmap({ companyId: company.id, viewerId: viewer?.userId });
  const base = `/c/${company.slug}`;

  return (
    <>
      <section className="bd-hero">
        <div>
          <h1>{t("نقشه راه", "Roadmap")}</h1>
          <p>
            {t(
              `چیزی که ${company.name} برنامه‌ریزی کرده، می‌سازه و منتشر می‌کنه. هر کارت به فیدبک پشتش وصل هست.`,
              `What ${company.name} is planning, building and shipping. Every card links to the feedback behind it.`,
            )}
          </p>
        </div>
        <div className="bd-hero-actions">
          <Link href={`${base}/new`} className="bd-submit">
            {t("ثبت فیدبک", "Submit feedback")}
          </Link>
        </div>
      </section>

      <div className="bd-cols">
        {columns.map((column) => {
          const items = posts.filter((post) => post.status === column.status);
          return (
            <section key={column.status} className="bd-col" data-status={column.status}>
              <div className="bd-col-head">
                <span className="bd-col-dot" aria-hidden="true" />
                <h2>{statusLabel(column.status, locale)}</h2>
                <span className="bd-col-count">{formatNumber(items.length, locale)}</span>
              </div>
              <p className="bd-helpful-sub" style={{ margin: "10px 2px 0" }}>
                {column.hint}
              </p>
              {items.length === 0 ? (
                <p className="bd-col-empty">{t("هنوز چیزی اینجا نیست.", "Nothing here yet.")}</p>
              ) : (
                <ul className="bd-col-list">
                  {items.map((post) => {
                    const kind = feedbackKind(post.type, post.category);
                    return (
                      <li key={post.id}>
                        <Link href={`${base}/p/${post.id}`} className="bd-col-card">
                          <strong>{post.title}</strong>
                          <span className="bd-col-card-foot">
                            {kind ? <FeedbackKindBadge kind={kind} locale={locale} /> : null}
                            <span style={{ marginInlineStart: "auto" }}>
                              <VoteUpIcon size={10} /> {formatNumber(post.upvotes, locale)}
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
