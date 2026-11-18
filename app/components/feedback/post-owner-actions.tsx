"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteOwnPostAction } from "@/app/feedback-actions";
import ConfirmDialog from "@/app/components/confirm-dialog";
import { useT } from "@/lib/i18n/client";

export default function PostOwnerActions({
  postId,
  redirectTo = "/",
  label,
  confirmText,
}: {
  postId: string;
  redirectTo?: string;
  label?: string;
  confirmText?: string;
}) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    if (busy) return;

    setBusy(true);
    setError(null);
    const result = await deleteOwnPostAction(postId);
    setBusy(false);
    setConfirming(false);

    if (result.ok) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setError(result.error);
  }

  return (
    <div className="fb-owner-actions">
      <button
        type="button"
        className="fb-btn fb-btn-danger fb-btn-sm"
        onClick={() => setConfirming(true)}
        disabled={busy}
      >
        {busy ? t("در حال حذف...", "Deleting...") : (label ?? t("حذف فیدبک", "Delete feedback"))}
      </button>
      {error ? (
        <span className="field-hint" style={{ color: "var(--red)" }}>
          {error}
        </span>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title={t("حذف فیدبک؟", "Delete feedback?")}
        description={confirmText ?? t("این فیدبک با همه کامنت‌هایش برای همیشه حذف شود؟", "Delete this feedback and all its comments for good?")}
        confirmLabel={t("حذف فیدبک", "Delete feedback")}
        busy={busy}
        onConfirm={() => void remove()}
        onCancel={() => {
          if (!busy) setConfirming(false);
        }}
      />
    </div>
  );
}
