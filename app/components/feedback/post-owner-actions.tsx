"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteOwnPostAction } from "@/app/feedback-actions";

export default function PostOwnerActions({
  postId,
  redirectTo = "/feed",
  label = "حذف بازخورد",
  confirmText = "این بازخورد با همه کامنت‌هایش برای همیشه حذف شود؟",
}: {
  postId: string;
  redirectTo?: string;
  label?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (busy) return;
    if (!window.confirm(confirmText)) return;

    setBusy(true);
    setError(null);
    const result = await deleteOwnPostAction(postId);
    setBusy(false);

    if (result.ok) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setError(result.error);
  }

  return (
    <div className="fb-owner-actions">
      <button type="button" className="fb-btn fb-btn-danger fb-btn-sm" onClick={remove} disabled={busy}>
        {busy ? "در حال حذف..." : label}
      </button>
      {error ? (
        <span className="field-hint" style={{ color: "var(--red)" }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
