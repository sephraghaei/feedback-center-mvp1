import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/app/components/feedback/markdown";
import { getCompanyBySlug } from "@/lib/companies";
import { listChangelog } from "@/lib/feedback/changelog";
import { formatDate } from "@/lib/feedback/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  return { title: company ? `${company.name} updates | Vasa` : "Updates | Vasa" };
}

export default async function CompanyUpdatesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const entries = await listChangelog(40, company.id);
  const base = `/c/${company.slug}`;

  return (
    <>
      <section className="bd-hero">
        <div>
          <h1>Updates</h1>
          <p>Everything {company.name} has shipped, newest first.</p>
        </div>
        <div className="bd-hero-actions">
          <Link href={`${base}/new`} className="bd-submit">
            Submit feedback
          </Link>
        </div>
      </section>

      <div className="bd-updates">
        {entries.length === 0 ? (
          <div className="bd-empty">
            <strong>No updates yet.</strong>
            <p>When {company.name} ships something new, it lands here first.</p>
            <Link href={base} className="bd-btn">
              Back to feedback
            </Link>
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="bd-update">
              <time className="bd-update-date" dateTime={entry.publishedAt.toISOString()}>
                {formatDate(entry.publishedAt)}
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
