"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteOwnPostAction } from "@/app/feedback-actions";
import ConfirmDialog from "@/app/components/confirm-dialog";

export default function PostOwnerActions({
  postId,
  redirectTo = "/",
  label = "Delete feedback",
  confirmText = "Delete this feedback and all its comments for good?",
}: {
  postId: string;
  redirectTo?: string;
  label?: string;
  confirmText?: string;
}) {
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
        {busy ? "Deleting..." : label}
      </button>
      {error ? (
        <span className="field-hint" style={{ color: "var(--red)" }}>
          {error}
        </span>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title="Delete feedback?"
        description={confirmText}
        confirmLabel="Delete feedback"
        busy={busy}
        onConfirm={() => void remove()}
        onCancel={() => {
          if (!busy) setConfirming(false);
        }}
      />
    </div>
  );
}
