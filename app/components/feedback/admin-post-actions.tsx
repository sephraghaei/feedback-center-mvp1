"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePostAction, hidePostAction } from "@/app/feedback-actions";
import ConfirmDialog from "@/app/components/confirm-dialog";
import { useT } from "@/lib/i18n/client";

export default function AdminPostActions({
  postId,
  hidden,
}: {
  postId: string;
  hidden: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

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
    setBusy(true);
    setError(null);
    const result = await deletePostAction(postId);
    setBusy(false);
    setConfirming(false);
    if (result.ok) {
      router.push("/");
      router.refresh();
      return;
    }
    setError(result.error);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <button type="button" className="fb-btn fb-btn-ghost fb-btn-sm" onClick={toggleHidden} disabled={busy}>
        {hidden ? t("بازگرداندن به دید عمومی", "Restore to public") : t("پنهان کردن", "Hide")}
      </button>
      <button
        type="button"
        className="fb-btn fb-btn-danger fb-btn-sm"
        onClick={() => setConfirming(true)}
        disabled={busy}
      >
        {t("حذف", "Delete")}
      </button>
      {error ? (
        <span className="field-hint" style={{ color: "var(--red)" }}>
          {error}
        </span>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title={t("حذف این فیدبک؟", "Delete this feedback?")}
        description={t(
          "این فیدبک با همه کامنت‌هایش برای همیشه حذف می‌شود.",
          "This feedback and all its comments will be deleted for good.",
        )}
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
