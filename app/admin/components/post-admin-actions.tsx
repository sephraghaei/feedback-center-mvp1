"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePostAction, hidePostAction, movePostAction } from "@/app/feedback-actions";
import { ROADMAP_STATUSES } from "@/lib/feedback/constants";
import { STATUS_LABELS } from "@/lib/feedback/labels";
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
  const [value, setValue] = useState(status);
  const [isHidden, setIsHidden] = useState(hidden);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!window.confirm("این بازخورد برای همیشه حذف شود؟")) return;
    setBusy(true);
    setError(null);
    const result = await deletePostAction(postId);
    setBusy(false);
    if (result.ok) {
      router.refresh();
      return;
    }
    setError(result.error);
  }

  return (
    <div className="row-actions" style={{ flexWrap: "wrap" }}>
      <span className="filter-select" style={{ minWidth: 130 }}>
        <select
          value={value}
          onChange={(event) => void move(event.target.value)}
          disabled={busy}
          aria-label="تغییر ستون نقشه راه"
        >
          {ROADMAP_STATUSES.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABELS[option]}
            </option>
          ))}
        </select>
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={toggleHidden}
        disabled={busy}
        title={isHidden ? "بازگرداندن به فید" : "پنهان کردن از فید"}
        aria-label={isHidden ? "بازگرداندن به فید" : "پنهان کردن از فید"}
      >
        <Icon name={isHidden ? "eye" : "eye-off"} size={16} />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-icon danger"
        onClick={remove}
        disabled={busy}
        title="حذف بازخورد"
        aria-label="حذف بازخورد"
      >
        <Icon name="trash" size={16} />
      </button>
      {error ? (
        <span className="form-error" style={{ padding: "4px 8px", fontSize: "0.7rem" }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
