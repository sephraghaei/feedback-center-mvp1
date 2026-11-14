"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { movePostAction } from "@/app/feedback-actions";
import { ROADMAP_STATUSES } from "@/lib/feedback/constants";
import { STATUS_LABELS } from "@/lib/feedback/labels";

export default function MoveMenu({ postId, status }: { postId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: string) {
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

  return (
    <div>
      <select
        className="input fb-move"
        value={value}
        disabled={busy}
        aria-label="تغییر ستون نقشه راه"
        onChange={(event) => void change(event.target.value)}
      >
        {ROADMAP_STATUSES.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      {error ? (
        <p className="field-hint" style={{ color: "var(--red)", marginTop: 4 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
