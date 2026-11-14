"use client";

import { useEffect, useRef, useState } from "react";
import { faNumber } from "@/lib/feedback/labels";

type Comment = {
  name: string;
  initial: string;
  tag: string;
  status: string;
  tone: "open" | "progress" | "done";
  text: string;
  short: string;
  likes: number;
};

const COMMENTS: Comment[] = [
  {
    name: "سارا",
    initial: "س",
    tag: "درخواست قابلیت",
    status: "در حال بررسی",
    tone: "open",
    text: "می‌شه فیلترهای فید رو ذخیره کنم؟ هر بار باید از اول انتخاب کنم.",
    short: "فیلترهای فید رو می‌شه ذخیره کرد؟",
    likes: 12,
  },
  {
    name: "امیر",
    initial: "ا",
    tag: "بهبود",
    status: "برنامه‌ریزی شده",
    tone: "progress",
    text: "خروجی گرفتن از گزارش‌ها برای جلسه‌ها خیلی کمک می‌کنه.",
    short: "خروجی گزارش‌ها برای جلسه‌ها لازمه.",
    likes: 8,
  },
  {
    name: "نگار",
    initial: "ن",
    tag: "منتشر شده",
    status: "رسیده به انتشار",
    tone: "done",
    text: "وضعیت درخواست‌ها رو دقیق نشون می‌دین. همین شفافیت عالیه.",
    short: "پیگیری وضعیت‌ها همین شفافیت رو می‌سازه.",
    likes: 21,
  },
];

type IconName = "bubble" | "heart" | "thumb" | "star" | "check" | "spark";

const SYMBOLS: { icon: IconName; className: string }[] = [
  { icon: "bubble", className: "s1" },
  { icon: "heart", className: "s2" },
  { icon: "star", className: "s3" },
  { icon: "check", className: "s4" },
  { icon: "spark", className: "s5" },
  { icon: "thumb", className: "s6" },
];

function HeroIcon({ name, filled = false }: { name: IconName; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {name === "bubble" ? (
        <>
          <rect x="3.2" y="4.2" width="17.6" height="13.2" rx="3.8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.6 17.4 6 21.4l6.4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {name === "heart" ? (
        <path
          d="M12 20.3s-7.3-4.7-7.3-10.2A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.3 2.5c0 5.5-7.3 10.2-7.3 10.2Z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      ) : null}
      {name === "thumb" ? (
        <>
          <path
            d="M7.4 10.2 11 3.6c1.3.3 2 1.2 1.9 2.5l-.5 3.2h4.7c1.2 0 2 1 1.7 2.2l-1.3 5.5a2 2 0 0 1-1.9 1.5H7.4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M7.4 10.2v8.3M7.4 10.2H4.5v8.3h2.9" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </>
      ) : null}
      {name === "star" ? (
        <path
          d="m12 3.5 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      ) : null}
      {name === "check" ? (
        <>
          <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
          <path d="m8.3 12.2 2.5 2.5 4.9-5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {name === "spark" ? (
        <path
          d="M12 3v3.4M12 17.6V21M3 12h3.4M17.6 12H21M5.6 5.6l2.4 2.4M16 16l2.4 2.4M18.4 5.6 16 8M8 16l-2.4 2.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

function LikeButton({
  liked,
  count,
  onToggle,
  small = false,
}: {
  liked: boolean;
  count: number;
  onToggle: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      className={`hero-like${small ? " hero-like-sm" : ""}${liked ? " is-liked" : ""}`}
      aria-pressed={liked}
      aria-label={`${liked ? "رای داده شد" : "رای دادن به این نمونه بازخورد"}، ${faNumber(count)} رای`}
      onClick={onToggle}
    >
      <span className="hero-like-icon">
        <HeroIcon name="heart" filled={liked} />
      </span>
      <span className="hero-like-count">{faNumber(count)}</span>
    </button>
  );
}

function CommentCard({ comment, side }: { comment: Comment; side: "start" | "end" }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className={`hero-comment hero-comment-${side}`}>
      <div className="hero-comment-head">
        <span className="hero-avatar" aria-hidden="true">
          {comment.initial}
        </span>
        <span className="hero-comment-name">{comment.name}</span>
        <span className="hero-comment-tag">{comment.tag}</span>
      </div>
      <p className="hero-comment-text">{comment.text}</p>
      <div className="hero-comment-foot">
        <span className={`hero-status tone-${comment.tone}`}>
          <i aria-hidden="true" />
          {comment.status}
        </span>
        <LikeButton liked={liked} count={comment.likes + (liked ? 1 : 0)} onToggle={() => setLiked((value) => !value)} />
      </div>
    </article>
  );
}

export function HeroCommentScene() {
  const symbolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = symbolsRef.current?.parentElement;
    if (!host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      host.style.setProperty("--px", x.toFixed(3));
      host.style.setProperty("--py", y.toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduce.matches) return;
      x = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
      y = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      x = 0;
      y = 0;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      apply();
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.style.removeProperty("--px");
      host.style.removeProperty("--py");
    };
  }, []);

  return (
    <>
      <div ref={symbolsRef} className="fb-hero-symbols" aria-hidden="true">
        {SYMBOLS.map((symbol) => (
          <span key={symbol.className} className={`fb-symbol ${symbol.className}`}>
            <span className="fb-symbol-inner">
              <HeroIcon name={symbol.icon} />
            </span>
          </span>
        ))}
      </div>

      <div className="fb-hero-comment-layer" role="group" aria-label="نمونه بازخوردهای کاربران">
        <CommentCard comment={COMMENTS[0]} side="start" />
        <CommentCard comment={COMMENTS[1]} side="end" />
        <div className="fb-typing" aria-hidden="true">
          <span className="hero-avatar">ن</span>
          <span className="fb-typing-dots">
            <i />
            <i />
            <i />
          </span>
          <span>داره می‌نویسه...</span>
        </div>
      </div>
    </>
  );
}

export function HeroTicker() {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<boolean[]>(() => COMMENTS.map(() => false));
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % COMMENTS.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [paused]);

  const comment = COMMENTS[index];
  const isLiked = liked[index];
  const count = comment.likes + (isLiked ? 1 : 0);

  function toggleLike() {
    setLiked((current) => current.map((value, position) => (position === index ? !value : value)));
  }

  return (
    <div
      className="fb-hero-ticker"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <span className="hero-ticker-live" aria-hidden="true">
        <i />
        زنده
      </span>
      <div className="hero-ticker-body">
        <p className="hero-ticker-text" key={index}>
          <span className="hero-ticker-name">{comment.name}:</span> {comment.short}
        </p>
        <div className="hero-ticker-dots" role="group" aria-label="نمونه بازخوردها">
          {COMMENTS.map((item, position) => (
            <button
              key={item.name}
              type="button"
              className={position === index ? "on" : ""}
              aria-label={`نمایش بازخورد ${item.name}`}
              aria-pressed={position === index}
              onClick={() => setIndex(position)}
            />
          ))}
        </div>
      </div>
      <LikeButton liked={isLiked} count={count} onToggle={toggleLike} small />
    </div>
  );
}
