"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePostAction, hidePostAction } from "@/app/feedback-actions";

export default function AdminPostActions({
  postId,
  hidden,
}: {
  postId: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleHidden() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await hidePostAction(postId, !hidden);
    setBusy(false);
    if (result.ok) {
      router.refresh();
      return;
    }
    setError(result.error);
  }

  async function remove() {
    if (busy) return;
    if (!window.confirm("این مورد برای همیشه حذف شود؟")) return;
    setBusy(true);
    setError(null);
    const result = await deletePostAction(postId);
    setBusy(false);
    if (result.ok) {
      router.push("/feed");
      router.refresh();
      return;
    }
    setError(result.error);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <button type="button" className="fb-btn fb-btn-ghost fb-btn-sm" onClick={toggleHidden} disabled={busy}>
        {hidden ? "بازگرداندن به دید عمومی" : "پنهان کردن"}
      </button>
      <button type="button" className="fb-btn fb-btn-danger fb-btn-sm" onClick={remove} disabled={busy}>
        حذف
      </button>
      {error ? (
        <span className="field-hint" style={{ color: "var(--red)" }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
