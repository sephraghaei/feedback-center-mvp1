import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SubmitFeedbackForm from "@/app/components/board/submit-feedback-form";
import { getCompanyBySlug } from "@/lib/companies";
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
      ? t(`ثبت فیدبک برای ${company.name} | وسا`, `Submit feedback to ${company.name} | Vasa`)
      : t("ثبت فیدبک | وسا", "Submit feedback | Vasa"),
  };
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
  const t = translator(await getLocale());
  const base = `/c/${company.slug}`;
  const here = `${base}/new`;

  return (
    <div className="bd-form-page">
      <div className="bd-form-head">
        <Link href={base} className="bd-back">
          <span aria-hidden="true">←</span>
          {t("بازگشت به فیدبک", "Back to feedback")}
        </Link>
        <h1>{t("ثبت فیدبک", "Submit feedback")}</h1>
        <p>
          {t(
            `یک ایده بنویس، باگ گزارش کن یا به ${company.name} تشکر بفرست. هر چی می‌نویسی برای همه دیده می‌شه.`,
            `Share an idea, report a bug or send some praise to ${company.name}. Everything you post is visible to the community.`,
          )}
        </p>
      </div>

      {viewer ? (
        <SubmitFeedbackForm slug={company.slug} companyName={company.name} />
      ) : (
        <div className="bd-signin-card">
          <p>
            {t(
              "برای نوشتن فیدبک وارد شو. یک قدمه و برمی‌گردی همین‌جا.",
              "Sign in to post feedback. It takes one step and you return right here.",
            )}
          </p>
          <div className="bd-signin-actions">
            <Link
              href={`/?next=${encodeURIComponent(here)}#account`}
              className="bd-btn bd-btn-primary"
            >
              {t("ادامه با ایمیل یا گوگل", "Continue with email or Google")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
