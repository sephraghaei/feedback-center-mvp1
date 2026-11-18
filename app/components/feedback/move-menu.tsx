"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { movePostAction } from "@/app/feedback-actions";
import { ROADMAP_STATUSES } from "@/lib/feedback/constants";
import { statusLabel } from "@/lib/feedback/labels";
import { useLocale, useT } from "@/lib/i18n/client";

export default function MoveMenu({ postId, status }: { postId: string; status: string }) {
  const locale = useLocale();
  const t = useT();
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
        aria-label={t("تغییر ستون نقشه راه", "Change roadmap status")}
        onChange={(event) => void change(event.target.value)}
      >
        {ROADMAP_STATUSES.map((option) => (
          <option key={option} value={option}>
            {statusLabel(option, locale)}
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
