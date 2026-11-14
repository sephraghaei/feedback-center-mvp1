"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { answerSupportAction } from "@/app/feedback-actions";
import { SUPPORT_STATUSES } from "@/lib/feedback/constants";
import { STATUS_LABELS } from "@/lib/feedback/labels";

export default function SupportReply({
  postId,
  status,
  reply,
}: {
  postId: string;
  status: string;
  reply: string | null;
}) {
  const router = useRouter();
  const [text, setText] = useState(reply ?? "");
  const [nextStatus, setNextStatus] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setSaved(false);

    const result = await answerSupportAction(postId, text, nextStatus);
    setBusy(false);

    if (result.ok) {
      setSaved(true);
      router.refresh();
      return;
    }
    setError(result.error);
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "grid",
        gap: 10,
        borderTop: "1px solid var(--line)",
        marginTop: 14,
        paddingTop: 14,
      }}
    >
      <div className="field">
        <label htmlFor={`reply-${postId}`}>
          پاسخ به کاربر <span className="opt">(Markdown پشتیبانی می‌شود)</span>
        </label>
        <textarea
          id={`reply-${postId}`}
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="پاسخ روشن و کوتاه بنویس."
          maxLength={10000}
          disabled={busy}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <div className="field" style={{ maxWidth: 190 }}>
          <select
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
            disabled={busy}
            aria-label="وضعیت درخواست"
          >
            {SUPPORT_STATUSES.map((option) => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ marginTop: 4 }}>
          {busy ? "در حال ذخیره..." : "ذخیره پاسخ و وضعیت"}
        </button>
        {saved ? <span className="pill ok">ذخیره شد</span> : null}
      </div>

      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
