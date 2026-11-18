"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePostAction, hidePostAction, movePostAction } from "@/app/feedback-actions";
import ConfirmDialog from "@/app/components/confirm-dialog";
import { ROADMAP_STATUSES } from "@/lib/feedback/constants";
import { statusLabel } from "@/lib/feedback/labels";
import { useLocale, useT } from "@/lib/i18n/client";
import { Icon } from "./bits";

export default function PostAdminActions({
  postId,
  status,
  hidden,
}: {
  postId: string;
  status: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const [value, setValue] = useState(status);
  const [isHidden, setIsHidden] = useState(hidden);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function move(next: string) {
    if (next === value || busy) return;
    const previous = value;
    setValue(next);
    setBusy(true);
    setError(null);
    const result = await movePostAction(postId, next);
    setBusy(false);
    if (result.ok) {
      router.refresh();
      return;
    }
    setValue(previous);
    setError(result.error);
  }

  async function toggleHidden() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await hidePostAction(postId, !isHidden);
    setBusy(false);
    if (result.ok) {
      setIsHidden(!isHidden);
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
      router.refresh();
      return;
    }
    setError(result.error);
  }

  const hiddenLabel = isHidden ? t("بازگرداندن به فید", "Restore to the board") : t("پنهان کردن از فید", "Hide from the board");

  return (
    <div className="row-actions" style={{ flexWrap: "wrap" }}>
      <span className="filter-select" style={{ minWidth: 130 }}>
        <select
          value={value}
          onChange={(event) => void move(event.target.value)}
          disabled={busy}
          aria-label={t("تغییر ستون نقشه راه", "Change roadmap status")}
        >
          {ROADMAP_STATUSES.map((option) => (
            <option key={option} value={option}>
              {statusLabel(option, locale)}
            </option>
          ))}
        </select>
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={toggleHidden}
        disabled={busy}
        title={hiddenLabel}
        aria-label={hiddenLabel}
      >
        <Icon name={isHidden ? "eye" : "eye-off"} size={16} />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-icon danger"
        onClick={() => setConfirming(true)}
        disabled={busy}
        title={t("حذف فیدبک", "Delete feedback")}
        aria-label={t("حذف فیدبک", "Delete feedback")}
      >
        <Icon name="trash" size={16} />
      </button>
      {error ? (
        <span className="form-error" style={{ padding: "4px 8px", fontSize: "0.7rem" }}>
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
