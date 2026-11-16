"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { addCommentAction, deleteOwnCommentAction, voteCommentAction } from "@/app/feedback-actions";
import ConfirmDialog from "@/app/components/confirm-dialog";
import type { CommentView } from "@/lib/feedback/comments";
import { faDate, faNumber } from "@/lib/feedback/labels";
import { mediaUrl } from "@/lib/feedback/media";
import Avatar from "./avatar";
import FormatToolbar from "./format-toolbar";
import { CommentIcon, ReplyIcon, TrashIcon, VoteDownIcon, VoteUpIcon } from "./icons";
import Markdown from "./markdown";

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form className={`fb-comment-form ${compact ? "compact" : ""}`} onSubmit={onSubmit}>
      <textarea
        ref={inputRef}
        className="input fb-comment-input"
        rows={compact ? 2 : 3}
        maxLength={2000}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={submitLabel}
        autoFocus={autoFocus}
      />
      <FormatToolbar value={value} onChange={onChange} textareaRef={inputRef} compact />
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
  canDelete,
  deleting,
  onVote,
  onReply,
  onDelete,
  footer,
}: {
  item: CommentView;
  postAuthorId: string;
  pending: boolean;
  compact?: boolean;
  canDelete?: boolean;
  deleting?: boolean;
  onVote: (item: CommentView, value: 1 | -1) => void;
  onReply?: () => void;
  onDelete?: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className={`fb-comment ${compact ? "fb-comment-reply" : ""}`}>
      <Avatar
        name={item.authorName}
        src={item.authorAvatarPath ? mediaUrl(item.authorAvatarPath) : null}
        size={compact ? 22 : 30}
        className="fb-comment-avatar"
      />
      <div className="fb-comment-main">
        <div className="fb-comment-head">
          <strong>{item.authorName}</strong>
          {item.authorId === postAuthorId ? <span className="fb-comment-badge">نویسنده</span> : null}
          <time dateTime={new Date(item.createdAt).toISOString()}>{faDate(item.createdAt)}</time>
        </div>
        <Markdown source={item.body} className="fb-prose fb-comment-body" />
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
              <VoteUpIcon size={13} />
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
              <VoteDownIcon size={13} />
            </button>
          </div>
          {onReply ? (
            <button type="button" className="fb-comment-reply-btn" onClick={onReply}>
              <ReplyIcon size={13} />
              پاسخ
            </button>
          ) : null}
          {canDelete && onDelete ? (
            <button
              type="button"
              className="fb-comment-delete-btn"
              onClick={onDelete}
              disabled={deleting}
              aria-label="حذف این کامنت"
              title="حذف کامنت"
            >
              <TrashIcon size={13} />
              {deleting ? "در حال حذف..." : "حذف"}
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
  viewerId,
  nextPath,
  locked,
}: {
  postId: string;
  postAuthorId: string;
  comments: CommentView[];
  signedIn: boolean;
  viewerId: string | null;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CommentView | null>(null);

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

  async function remove(item: CommentView) {
    if (deletingId) return;

    setActionError(null);
    setDeletingId(item.id);
    const result = await deleteOwnCommentAction(item.id);
    setDeletingId(null);
    setConfirmDelete(null);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setItems((prev) => prev.filter((row) => row.id !== item.id && row.parentId !== item.id));
    setReplyingTo((current) => (current === item.id ? null : current));
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
    <section className="fb-comments" id="comments" aria-labelledby="comments-title">
      <div className="fb-comments-head">
        <h2 id="comments-title">
          <CommentIcon size={16} />
          گفتگو
        </h2>
        <span className="fb-comments-count">{faNumber(items.length)} کامنت</span>
      </div>

      {locked ? (
        <p className="fb-note">این فید‌بک پنهان شده و کامنت تازه نمی‌پذیرد.</p>
      ) : signedIn ? (
        <CommentComposer
          value={draft}
          onChange={setDraft}
          onSubmit={submitRoot}
          busy={sending}
          error={error}
          placeholder="چیزی بنویس که به بهتر شدن این فید‌بک کمک کند."
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
                  canDelete={Boolean(viewerId) && item.authorId === viewerId}
                  deleting={deletingId === item.id}
                  onVote={vote}
                  onDelete={() => setConfirmDelete(item)}
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
                          canDelete={Boolean(viewerId) && reply.authorId === viewerId}
                          deleting={deletingId === reply.id}
                          onVote={vote}
                          onDelete={() => setConfirmDelete(reply)}
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

      <ConfirmDialog
        open={confirmDelete !== null}
        title={confirmDelete?.parentId ? "حذف پاسخ؟" : "حذف کامنت؟"}
        description={
          confirmDelete?.parentId
            ? "این پاسخ برای همیشه حذف می‌شود."
            : "این کامنت و پاسخ‌های خودت برای همیشه حذف می‌شوند."
        }
        confirmLabel={confirmDelete?.parentId ? "حذف پاسخ" : "حذف کامنت"}
        busy={Boolean(confirmDelete && deletingId === confirmDelete.id)}
        onConfirm={() => {
          if (confirmDelete) void remove(confirmDelete);
        }}
        onCancel={() => {
          if (!deletingId) setConfirmDelete(null);
        }}
      />
    </section>
  );
}
