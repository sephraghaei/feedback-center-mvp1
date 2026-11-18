import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SubmitFeedbackForm from "@/app/components/board/submit-feedback-form";
import { getCompanyBySlug } from "@/lib/companies";
import { getViewer } from "@/lib/feedback/viewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  return { title: company ? `Submit feedback to ${company.name} | Vasa` : "Submit feedback | Vasa" };
}

export default async function NewFeedbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const viewer = await getViewer();
  const base = `/c/${company.slug}`;
  const here = `${base}/new`;

  return (
    <div className="bd-form-page">
      <div className="bd-form-head">
        <Link href={base} className="bd-back">
          <span aria-hidden="true">←</span>
          Back to feedback
        </Link>
        <h1>Submit feedback</h1>
        <p>
          Share an idea, report a bug or send some praise to {company.name}. Everything you
          post is visible to the community.
        </p>
      </div>

      {viewer ? (
        <SubmitFeedbackForm slug={company.slug} companyName={company.name} />
      ) : (
        <div className="bd-signin-card">
          <p>Sign in to post feedback. It takes one step and you return right here.</p>
          <div className="bd-signin-actions">
            <Link
              href={`/?next=${encodeURIComponent(here)}#account`}
              className="bd-btn bd-btn-primary"
            >
              Continue with phone or email
            </Link>
            <Link href={`/sign-in?redirect_url=${encodeURIComponent(here)}`} className="bd-btn">
              Continue with Google
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
