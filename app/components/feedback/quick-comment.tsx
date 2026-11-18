"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { addCommentAction } from "@/app/feedback-actions";
import { formatNumber } from "@/lib/feedback/labels";
import { CommentIcon, SendIcon } from "./icons";

const EDGE = 12;
const GAP = 8;
const MOBILE = "(max-width: 640px)";

type Spot = { x: number; y: number; above: boolean };

export default function QuickComment({
  postId,
  count,
  signedIn,
  nextPath,
}: {
  postId: string;
  count: number;
  signedIn: boolean;
  nextPath: string;
}) {
  const router = useRouter();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(count);
  const [bump, setBump] = useState(false);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    if (window.matchMedia(MOBILE).matches) {
      setSpot(null);
      return;
    }

    const anchor = trigger.closest<HTMLElement>(".fb-card") ?? trigger;
    const rect = anchor.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const x = Math.max(EDGE, Math.min(trigger.getBoundingClientRect().left, window.innerWidth - width - EDGE));
    let y = rect.bottom + GAP;
    let above = false;

    if (y + height > window.innerHeight - EDGE) {
      const lifted = rect.top - height - GAP;
      if (lifted >= EDGE) {
        y = lifted;
        above = true;
      } else {
        y = Math.max(EDGE, window.innerHeight - height - EDGE);
      }
    }

    setSpot({ x, y, above });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!window.matchMedia(MOBILE).matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(
    () => () => {
      if (bumpTimer.current) clearTimeout(bumpTimer.current);
    },
    [],
  );

  function signIn() {
    router.push(`/?next=${encodeURIComponent(nextPath)}#account`);
  }

  function toggle() {
    setError(null);
    setOpen((value) => !value);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    if (!signedIn) {
      signIn();
      return;
    }

    const text = draft.trim();
    if (text.length < 2) {
      setError("کامنت باید حداقل ۲ نویسه باشد.");
      return;
    }

    setSending(true);
    setError(null);
    const result = await addCommentAction(postId, text, null);
    setSending(false);

    if (!result.ok) {
      setError(result.error);
      if (result.signIn) signIn();
      return;
    }

    setDraft("");
    setTotal((value) => value + 1);
    setBump(true);
    if (bumpTimer.current) clearTimeout(bumpTimer.current);
    bumpTimer.current = setTimeout(() => setBump(false), 520);
    setOpen(false);
    triggerRef.current?.focus();
    router.refresh();
  }

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <>
            <div className="fb-quick-scrim" aria-hidden="true" />
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label="گفتگو"
              className={`fb-quick ${spot ? "placed" : ""} ${spot?.above ? "above" : ""}`}
              style={
                spot
                  ? ({ "--quick-x": `${spot.x}px`, "--quick-y": `${spot.y}px` } as CSSProperties)
                  : undefined
              }
            >
              <div className="fb-quick-head">
                <span className="fb-quick-title">
                  <CommentIcon size={13} />
                  گفتگو
                </span>
                <span className="fb-quick-total">{formatNumber(total)} کامنت</span>
              </div>

              {signedIn ? (
                <form className="fb-quick-form" onSubmit={submit}>
                  <textarea
                    className="fb-quick-input"
                    rows={3}
                    maxLength={2000}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder="کامنتت رو بنویس..."
                    aria-label="متن کامنت"
                    autoFocus
                  />
                  {error ? (
                    <p className="fb-quick-error" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <div className="fb-quick-foot">
                    <span className="fb-quick-hint">
                      {formatNumber(draft.trim().length)} از ۲۰۰۰ نویسه
                    </span>
                    <div className="fb-quick-actions">
                      <Link href={`/p/${postId}#comments`} className="fb-quick-link">
                        دیدن گفتگو
                      </Link>
                      <button
                        type="submit"
                        className="fb-btn fb-btn-primary fb-btn-sm"
                        disabled={sending || draft.trim().length < 2}
                      >
                        <SendIcon size={14} />
                        {sending ? "در حال ارسال" : "ارسال"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="fb-quick-guest">
                  <p>برای نوشتن کامنت اول وارد حسابت شو.</p>
                  <div className="fb-quick-foot">
                    <Link href={`/p/${postId}#comments`} className="fb-quick-link">
                      دیدن گفتگو
                    </Link>
                    <button type="button" className="fb-btn fb-btn-primary fb-btn-sm" onClick={signIn}>
                      ورود
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`fb-action-btn ${open ? "on" : ""}`}
        aria-label={`${formatNumber(total)} کامنت، نوشتن کامنت`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        title="نوشتن کامنت"
        onClick={toggle}
      >
        <CommentIcon size={15} />
        <span className={`fb-action-count ${bump ? "bump" : ""}`}>{formatNumber(total)}</span>
        <span className="fb-action-label">کامنت</span>
      </button>
      {panel}
      <span className="sr-only" role="status">
        {bump ? "کامنت ثبت شد." : ""}
      </span>
    </>
  );
}
