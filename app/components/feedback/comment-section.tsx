"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { addCommentAction, voteCommentAction } from "@/app/feedback-actions";
import type { CommentView } from "@/lib/feedback/comments";
import { faDate, faNumber } from "@/lib/feedback/labels";

function CommentComposer({
  value,
  onChange,
  onSubmit,
  busy,
  error,
  placeholder,
  submitLabel,
  compact,
  autoFocus,
  onCancel,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  error: string | null;
  placeholder: string;
  submitLabel: string;
  compact?: boolean;
  autoFocus?: boolean;
  onCancel?: () => void;
}) {
  return (
    <form className={`fb-comment-form ${compact ? "compact" : ""}`} onSubmit={onSubmit}>
      <textarea
        className="input fb-comment-input"
        rows={compact ? 2 : 3}
        maxLength={2000}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={submitLabel}
        autoFocus={autoFocus}
      />
      <div className="fb-comment-form-foot">
        <span className="fb-comment-hint">{faNumber(value.trim().length)} از ۲۰۰۰ نویسه</span>
        <div className="fb-comment-foot-actions">
          {onCancel ? (
            <button type="button" className="fb-btn fb-btn-ghost fb-btn-sm" onClick={onCancel}>
              بی‌خیال
            </button>
          ) : null}
          <button
            type="submit"
            className="fb-btn fb-btn-primary fb-btn-sm"
            disabled={busy || value.trim().length < 2}
          >
            {busy ? "در حال ارسال..." : submitLabel}
          </button>
        </div>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </form>
  );
}

function CommentRow({
  item,
  postAuthorId,
  pending,
  compact,
  onVote,
  onReply,
  footer,
}: {
  item: CommentView;
  postAuthorId: string;
  pending: boolean;
  compact?: boolean;
  onVote: (item: CommentView, value: 1 | -1) => void;
  onReply?: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className={`fb-comment ${compact ? "fb-comment-reply" : ""}`}>
      <span className="fb-comment-avatar" aria-hidden="true">
        {item.authorName.trim().charAt(0) || "؟"}
      </span>
      <div className="fb-comment-main">
        <div className="fb-comment-head">
          <strong>{item.authorName}</strong>
          {item.authorId === postAuthorId ? <span className="fb-comment-badge">نویسنده</span> : null}
          <time dateTime={new Date(item.createdAt).toISOString()}>{faDate(item.createdAt)}</time>
        </div>
        <p className="fb-comment-body">{item.body}</p>
        <div className="fb-comment-actions">
          <div className={`fb-cvote ${item.myVote === 1 ? "up" : item.myVote === -1 ? "down" : ""}`}>
            <button
              type="button"
              className="fb-cvote-btn"
              onClick={() => onVote(item, 1)}
              disabled={pending}
              aria-pressed={item.myVote === 1}
              aria-label="رای مثبت به این کامنت"
              title="رای مثبت"
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
              onClick={() => onVote(item, -1)}
              disabled={pending}
              aria-pressed={item.myVote === -1}
              aria-label="رای منفی به این کامنت"
              title="رای منفی"
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
          {onReply ? (
            <button type="button" className="fb-comment-reply-btn" onClick={onReply}>
              پاسخ
            </button>
          ) : null}
        </div>
        {footer}
      </div>
    </div>
  );
}

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
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [pendingVote, setPendingVote] = useState<string | null>(null);

  function signIn() {
    router.push(`/?next=${encodeURIComponent(nextPath)}#account`);
  }

  function patch(id: string, changes: Partial<CommentView>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }

  async function sendComment(
    body: string,
    parentId: string | null,
    setBusy: (value: boolean) => void,
    setNote: (value: string | null) => void,
    onSuccess: () => void,
  ) {
    if (!signedIn) {
      signIn();
      return;
    }
    const text = body.trim();
    if (text.length < 2) return;

    setBusy(true);
    setNote(null);
    const result = await addCommentAction(postId, text, parentId);
    setBusy(false);

    if (!result.ok) {
      setNote(result.error);
      if (result.signIn) signIn();
      return;
    }

    setItems((prev) => [...prev, result.comment]);
    onSuccess();
  }

  function submitRoot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    void sendComment(draft, null, setSending, setError, () => setDraft(""));
  }

  function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!replyingTo || replySending) return;
    const parentId = replyingTo;
    void sendComment(replyDraft, parentId, setReplySending, setReplyError, () => {
      setReplyDraft("");
      setReplyError(null);
      setReplyingTo(null);
    });
  }

  function beginReply(item: CommentView) {
    if (locked) return;
    if (!signedIn) {
      signIn();
      return;
    }
    setReplyError(null);
    setReplyDraft("");
    setReplyingTo((current) => (current === item.id ? null : item.id));
  }

  function cancelReply() {
    setReplyingTo(null);
    setReplyDraft("");
    setReplyError(null);
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

    setActionError(null);
    setPendingVote(item.id);
    patch(item.id, { score: optimistic, myVote: next });

    const result = await voteCommentAction(item.id, next);
    setPendingVote(null);

    if (!result.ok) {
      patch(item.id, previous);
      setActionError(result.error);
      if (result.signIn) signIn();
      return;
    }

    patch(item.id, { score: result.score, myVote: result.myVote });
  }

  const roots = items
    .filter((item) => !item.parentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const repliesByParent = new Map<string, CommentView[]>();
  for (const item of items) {
    if (!item.parentId) continue;
    const list = repliesByParent.get(item.parentId) ?? [];
    list.push(item);
    repliesByParent.set(item.parentId, list);
  }
  for (const list of repliesByParent.values()) {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
        <CommentComposer
          value={draft}
          onChange={setDraft}
          onSubmit={submitRoot}
          busy={sending}
          error={error}
          placeholder="چیزی بنویس که به بهتر شدن این بازخورد کمک کند."
          submitLabel="ارسال کامنت"
        />
      ) : (
        <div className="fb-comment-guest">
          <p>برای نوشتن کامنت و رای دادن به کامنت‌ها اول وارد حسابت شو.</p>
          <button type="button" className="fb-btn fb-btn-primary fb-btn-sm" onClick={signIn}>
            ورود و نوشتن کامنت
          </button>
        </div>
      )}

      {actionError ? <p className="field-error">{actionError}</p> : null}

      {items.length === 0 ? (
        <p className="fb-comment-empty">هنوز کامنتی نیست. اولین نفر باش.</p>
      ) : (
        <ol className="fb-comment-list">
          {roots.map((item) => {
            const replies = repliesByParent.get(item.id) ?? [];
            return (
              <li key={item.id} className="fb-comment-thread">
                <CommentRow
                  item={item}
                  postAuthorId={postAuthorId}
                  pending={pendingVote === item.id}
                  onVote={vote}
                  onReply={locked ? undefined : () => beginReply(item)}
                  footer={
                    replyingTo === item.id ? (
                      <CommentComposer
                        compact
                        autoFocus
                        value={replyDraft}
                        onChange={setReplyDraft}
                        onSubmit={submitReply}
                        busy={replySending}
                        error={replyError}
                        placeholder={`پاسخ به ${item.authorName}...`}
                        submitLabel="ارسال پاسخ"
                        onCancel={cancelReply}
                      />
                    ) : null
                  }
                />
                {replies.length > 0 ? (
                  <ol className="fb-comment-replies">
                    {replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentRow
                          item={reply}
                          postAuthorId={postAuthorId}
                          pending={pendingVote === reply.id}
                          compact
                          onVote={vote}
                        />
                      </li>
                    ))}
                  </ol>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
