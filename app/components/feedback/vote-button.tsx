"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toggleUpvoteAction } from "@/app/feedback-actions";
import { formatNumber } from "@/lib/feedback/labels";
import { useLocale, useT } from "@/lib/i18n/client";
import { VoteUpIcon } from "./icons";

export default function VoteButton({
  postId,
  count,
  upvoted,
  signedIn,
  nextPath,
}: {
  postId: string;
  count: number;
  upvoted: boolean;
  signedIn: boolean;
  nextPath: string;
}) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [state, setState] = useState({ count, upvoted });
  const [busy, setBusy] = useState(false);
  const [roll, setRoll] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function vote() {
    if (!signedIn) {
      router.push(`/?next=${encodeURIComponent(nextPath)}#account`);
      return;
    }
    if (busy) return;

    const optimistic = !state.upvoted;
    setBusy(true);
    setError(null);
    setRoll((value) => value + 1);
    setState({ upvoted: optimistic, count: Math.max(0, state.count + (optimistic ? 1 : -1)) });

    const result = await toggleUpvoteAction(postId);
    setBusy(false);

    if (result.ok) {
      setState({ upvoted: result.upvoted, count: result.count });
      return;
    }

    setState({ count, upvoted });
    if (result.signIn) {
      router.push(`/?next=${encodeURIComponent(nextPath)}#account`);
      return;
    }
    setError(result.error);
  }

  return (
    <button
      type="button"
      className={`fb-action-btn fb-vote ${state.upvoted ? "on" : ""}`}
      onClick={vote}
      disabled={busy}
      aria-pressed={state.upvoted}
      aria-label={state.upvoted ? t("برداشتن رای", "Remove vote") : t("رای دادن", "Vote")}
      title={
        error ??
        (signedIn
          ? state.upvoted
            ? t("برداشتن رای", "Remove vote")
            : t("رای دادن", "Vote")
          : t("برای رای دادن وارد شو", "Log in to vote"))
      }
    >
      <VoteUpIcon size={15} />
      <span key={roll} className={`fb-vote-num${roll ? " is-rolling" : ""}`}>
        {formatNumber(state.count, locale)}
      </span>
    </button>
  );
}
