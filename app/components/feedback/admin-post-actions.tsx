"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePostAction, hidePostAction } from "@/app/feedback-actions";
import ConfirmDialog from "@/app/components/confirm-dialog";

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
        {hidden ? "Restore to public" : "Hide"}
      </button>
      <button
        type="button"
        className="fb-btn fb-btn-danger fb-btn-sm"
        onClick={() => setConfirming(true)}
        disabled={busy}
      >
        Delete
      </button>
      {error ? (
        <span className="field-hint" style={{ color: "var(--red)" }}>
          {error}
        </span>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title="Delete this feedback?"
        description="This feedback and all its comments will be deleted for good."
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
