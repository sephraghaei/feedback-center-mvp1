"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCommentAction, voteCommentAction } from "@/app/feedback-actions";
import type { CommentView } from "@/lib/feedback/comments";
import { faDate, faNumber } from "@/lib/feedback/labels";

export default function CommentSection({
  postId,
  postAuthorId,
  comments,
  signedIn,
  nextPath,
  locked,
}: {
  postId: string;
  postAuthorId: string;
  comments: CommentView[];
  signedIn: boolean;
  nextPath: string;
  locked: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState<CommentView[]>(comments);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function signIn() {
    router.push(`/?next=${encodeURIComponent(nextPath)}#account`);
  }

  function patch(id: string, changes: Partial<CommentView>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn) {
      signIn();
      return;
    }
    const body = draft.trim();
    if (body.length < 2 || sending) return;

    setSending(true);
    setError(null);
    const result = await addCommentAction(postId, body);
    setSending(false);

    if (!result.ok) {
      setError(result.error);
      if (result.signIn) signIn();
      return;
    }

    setItems((prev) => [result.comment, ...prev]);
    setDraft("");
  }

  async function vote(item: CommentView, value: 1 | -1) {
    if (!signedIn) {
      signIn();
      return;
    }
    if (pendingVote) return;

    const next = item.myVote === value ? 0 : value;
    const previous = { score: item.score, myVote: item.myVote };
    const optimistic = item.score - item.myVote + next;

    setError(null);
    setPendingVote(item.id);
    patch(item.id, { score: optimistic, myVote: next });

    const result = await voteCommentAction(item.id, next);
    setPendingVote(null);

    if (!result.ok) {
      patch(item.id, previous);
      setError(result.error);
      if (result.signIn) signIn();
      return;
    }

    patch(item.id, { score: result.score, myVote: result.myVote });
  }

  return (
    <section className="fb-comments" aria-labelledby="comments-title">
      <div className="fb-comments-head">
        <h2 id="comments-title">گفتگو</h2>
        <span className="fb-comments-count">{faNumber(items.length)} کامنت</span>
      </div>

      {locked ? (
        <p className="fb-note">این بازخورد پنهان شده و کامنت تازه نمی‌پذیرد.</p>
      ) : signedIn ? (
        <form className="fb-comment-form" onSubmit={submit}>
          <textarea
            className="input fb-comment-input"
            rows={3}
            maxLength={2000}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="چیزی بنویس که به بهتر شدن این بازخورد کمک کند."
            aria-label="متن کامنت"
          />
          <div className="fb-comment-form-foot">
            <span className="fb-comment-hint">{faNumber(draft.trim().length)} از ۲۰۰۰ نویسه</span>
            <button
              type="submit"
              className="fb-btn fb-btn-primary fb-btn-sm"
              disabled={sending || draft.trim().length < 2}
            >
              {sending ? "در حال ارسال..." : "ارسال کامنت"}
            </button>
          </div>
        </form>
      ) : (
        <div className="fb-comment-guest">
          <p>برای نوشتن کامنت و رای دادن به کامنت‌ها اول وارد حسابت شو.</p>
          <button type="button" className="fb-btn fb-btn-primary fb-btn-sm" onClick={signIn}>
            ورود و نوشتن کامنت
          </button>
        </div>
      )}

      {error ? <p className="field-error">{error}</p> : null}

      {items.length === 0 ? (
        <p className="fb-comment-empty">هنوز کامنتی نیست. اولین نفر باش.</p>
      ) : (
        <ol className="fb-comment-list">
          {items.map((item) => (
            <li key={item.id} className="fb-comment">
              <span className="fb-comment-avatar" aria-hidden="true">
                {item.authorName.trim().charAt(0) || "؟"}
              </span>
              <div className="fb-comment-main">
                <div className="fb-comment-head">
                  <strong>{item.authorName}</strong>
                  {item.authorId === postAuthorId ? (
                    <span className="fb-comment-badge">نویسنده</span>
                  ) : null}
                  <time dateTime={new Date(item.createdAt).toISOString()}>
                    {faDate(item.createdAt)}
                  </time>
                </div>
                <p className="fb-comment-body">{item.body}</p>
                <div
                  className={`fb-cvote ${item.myVote === 1 ? "up" : item.myVote === -1 ? "down" : ""}`}
                >
                  <button
                    type="button"
                    className="fb-cvote-btn"
                    onClick={() => vote(item, 1)}
                    disabled={pendingVote === item.id}
                    aria-pressed={item.myVote === 1}
                    aria-label="رای مثبت به این کامنت"
                    title={signedIn ? "رای مثبت" : "برای رای دادن وارد شو"}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 19V5" />
                      <path d="M5 12l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="fb-cvote-score">{faNumber(item.score)}</span>
                  <button
                    type="button"
                    className="fb-cvote-btn"
                    onClick={() => vote(item, -1)}
                    disabled={pendingVote === item.id}
                    aria-pressed={item.myVote === -1}
                    aria-label="رای منفی به این کامنت"
                    title={signedIn ? "رای منفی" : "برای رای دادن وارد شو"}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14" />
                      <path d="M19 12l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
