import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeedbackKindBadge from "@/app/components/feedback/kind-badge";
import { VoteUpIcon } from "@/app/components/feedback/icons";
import { getCompanyBySlug } from "@/lib/companies";
import { formatNumber, feedbackKind, STATUS_LABELS } from "@/lib/feedback/labels";
import { listRoadmap } from "@/lib/feedback/posts";
import { getViewer } from "@/lib/feedback/viewer";

const COLUMNS = [
  { status: "planned", hint: "Next up on the roadmap." },
  { status: "in_progress", hint: "Being built right now." },
  { status: "shipped", hint: "Live and in your hands." },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  return { title: company ? `${company.name} roadmap | Vasa` : "Roadmap | Vasa" };
}

export default async function CompanyRoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const viewer = await getViewer();
  const posts = await listRoadmap({ companyId: company.id, viewerId: viewer?.userId });
  const base = `/c/${company.slug}`;

  return (
    <>
      <section className="bd-hero">
        <div>
          <h1>Roadmap</h1>
          <p>
            What {company.name} is planning, building and shipping. Every card links to the
            feedback behind it.
          </p>
        </div>
        <div className="bd-hero-actions">
          <Link href={`${base}/new`} className="bd-submit">
            Submit feedback
          </Link>
        </div>
      </section>

      <div className="bd-cols">
        {COLUMNS.map((column) => {
          const items = posts.filter((post) => post.status === column.status);
          return (
            <section key={column.status} className="bd-col" data-status={column.status}>
              <div className="bd-col-head">
                <span className="bd-col-dot" aria-hidden="true" />
                <h2>{STATUS_LABELS[column.status]}</h2>
                <span className="bd-col-count">{formatNumber(items.length)}</span>
              </div>
              <p className="bd-helpful-sub" style={{ margin: "10px 2px 0" }}>
                {column.hint}
              </p>
              {items.length === 0 ? (
                <p className="bd-col-empty">Nothing here yet.</p>
              ) : (
                <ul className="bd-col-list">
                  {items.map((post) => {
                    const kind = feedbackKind(post.type, post.category);
                    return (
                      <li key={post.id}>
                        <Link href={`${base}/p/${post.id}`} className="bd-col-card">
                          <strong>{post.title}</strong>
                          <span className="bd-col-card-foot">
                            {kind ? <FeedbackKindBadge kind={kind} /> : null}
                            <span style={{ marginInlineStart: "auto" }}>
                              <VoteUpIcon size={10} /> {formatNumber(post.upvotes)}
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
