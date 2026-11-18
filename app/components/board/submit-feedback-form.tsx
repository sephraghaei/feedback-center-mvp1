"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitFeedbackAction } from "@/app/(board)/actions";
import { AlertIcon, BulbIcon, HeartIcon } from "@/app/components/feedback/icons";
import { KIND_LABELS, type FeedbackKind } from "@/lib/feedback/labels";

const KINDS = [
  { value: "bug", label: KIND_LABELS.bug, Icon: AlertIcon },
  { value: "improvement", label: KIND_LABELS.improvement, Icon: BulbIcon },
  { value: "praise", label: KIND_LABELS.praise, Icon: HeartIcon },
] as const;

export default function SubmitFeedbackForm({
  slug,
  companyName,
}: {
  slug: string;
  companyName: string;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<FeedbackKind>("improvement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 3) {
      setError("Give your feedback a title with at least 3 characters.");
      return;
    }
    if (cleanBody.length < 10) {
      setError("Add a little more detail, at least 10 characters.");
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
        <span className="bd-field-label">Type</span>
        <div className="bd-kind-row" role="group" aria-label="Feedback type">
          {KINDS.map(({ value, label, Icon }) => (
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
        <label htmlFor="feedback-title">Title</label>
        <input
          id="feedback-title"
          value={title}
          maxLength={140}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={`What should ${companyName} know?`}
        />
        <p className="bd-field-hint">Keep it short and specific.</p>
      </div>

      <div className="bd-field">
        <label htmlFor="feedback-body">Details</label>
        <textarea
          id="feedback-body"
          value={body}
          maxLength={20000}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What happened, what you expected, and why it matters. Markdown works."
        />
      </div>

      {error ? <p className="bd-alert">{error}</p> : null}

      <div className="bd-form-foot">
        <p className="bd-form-note">Posted publicly on the {companyName} board.</p>
        <button type="submit" className="bd-btn bd-btn-primary" disabled={submitting}>
          {submitting ? "Posting..." : "Post feedback"}
        </button>
      </div>
    </form>
  );
}
