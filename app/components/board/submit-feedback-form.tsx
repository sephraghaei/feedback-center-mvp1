"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitFeedbackAction } from "@/app/(board)/actions";
import { AlertIcon, BulbIcon, HeartIcon } from "@/app/components/feedback/icons";
import { kindLabel, type FeedbackKind } from "@/lib/feedback/labels";
import { useLocale, useT } from "@/lib/i18n/client";

export default function SubmitFeedbackForm({
  slug,
  companyName,
}: {
  slug: string;
  companyName: string;
}) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [kind, setKind] = useState<FeedbackKind>("improvement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const kinds = [
    { value: "bug", label: kindLabel("bug", locale), Icon: AlertIcon },
    { value: "improvement", label: kindLabel("improvement", locale), Icon: BulbIcon },
    { value: "praise", label: kindLabel("praise", locale), Icon: HeartIcon },
  ] as const;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 3) {
      setError(
        t(
          "برای فیدبکت یک عنوان بذار، حداقل ۳ نویسه.",
          "Give your feedback a title with at least 3 characters.",
        ),
      );
      return;
    }
    if (cleanBody.length < 10) {
      setError(t("کمی بیشتر توضیح بده، حداقل ۱۰ نویسه.", "Add a little more detail, at least 10 characters."));
      return;
    }

    setSubmitting(true);
    const result = await submitFeedbackAction(slug, {
      kind,
      title: cleanTitle,
      body: cleanBody,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(`/c/${slug}/p/${result.id}`);
    router.refresh();
  }

  return (
    <form className="bd-form" onSubmit={submit}>
      <div className="bd-field">
        <span className="bd-field-label">{t("نوع", "Type")}</span>
        <div className="bd-kind-row" role="group" aria-label={t("نوع فیدبک", "Feedback type")}>
          {kinds.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              className={`bd-kind-toggle ${kind === value ? "active" : ""}`}
              onClick={() => setKind(value)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bd-field">
        <label htmlFor="feedback-title">{t("عنوان", "Title")}</label>
        <input
          id="feedback-title"
          value={title}
          maxLength={140}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t(`${companyName} باید چی بدونه؟`, `What should ${companyName} know?`)}
        />
        <p className="bd-field-hint">{t("کوتاه و مشخص بنویس.", "Keep it short and specific.")}</p>
      </div>

      <div className="bd-field">
        <label htmlFor="feedback-body">{t("توضیحات", "Details")}</label>
        <textarea
          id="feedback-body"
          value={body}
          maxLength={20000}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t(
            "چی شد، چه انتظاری داشتی و چرا مهمه. مارک‌داون هم کار می‌کنه.",
            "What happened, what you expected, and why it matters. Markdown works.",
          )}
        />
      </div>

      {error ? <p className="bd-alert">{error}</p> : null}

      <div className="bd-form-foot">
        <p className="bd-form-note">
          {t(`روی برد ${companyName} به‌صورت عمومی منتشر می‌شه.`, `Posted publicly on the ${companyName} board.`)}
        </p>
        <button type="submit" className="bd-btn bd-btn-primary" disabled={submitting}>
          {submitting ? t("در حال ثبت...", "Posting...") : t("ثبت فیدبک", "Post feedback")}
        </button>
      </div>
    </form>
  );
}
