"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { faNumber } from "@/lib/feedback/labels";
import ComposerButton from "./composer-button";

function ShotStart() {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">فید‌بک‌ها</span>
        <span className="fb-shot-pill">جدید</span>
      </div>
      <div className="fb-shot-item is-ghost">
        <span className="fb-shot-num">۱</span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w80" />
          <span className="fb-shot-line w50" />
        </span>
      </div>
      <div className="fb-shot-item is-ghost">
        <span className="fb-shot-num">۲</span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w65" />
          <span className="fb-shot-line w40" />
        </span>
      </div>
      <div className="fb-shot-empty">
        <span className="fb-shot-plus" />
        <strong>اینجا یه چیزی کمه</strong>
        <span>هر ایده‌ای داری، همین‌جا بنویس</span>
      </div>
    </>
  );
}

function ShotWrite() {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">فید‌بک جدید</span>
        <span className="fb-shot-pill">پیش‌نویس</span>
      </div>
      <div className="fb-shot-field">
        <span className="fb-shot-label">عنوان</span>
        <span className="fb-shot-input">دکمه پرداخت توی موبایل کار نمی‌کنه</span>
      </div>
      <div className="fb-shot-field">
        <span className="fb-shot-label">توضیح</span>
        <span className="fb-shot-box">
          <span className="fb-shot-line w90" />
          <span className="fb-shot-line w70" />
          <span className="fb-shot-line w45" />
        </span>
      </div>
      <div className="fb-shot-chips">
        <span className="fb-shot-chip">فروشگاه</span>
        <span className="fb-shot-chip is-soft">موبایل</span>
      </div>
      <span className="fb-shot-btn">ثبت فیدبک</span>
    </>
  );
}

function ShotVote() {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">فید‌بک‌ها</span>
        <span className="fb-shot-pill">داغ‌ترین</span>
      </div>
      <div className="fb-shot-item">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />۲۴
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w85" />
          <span className="fb-shot-line w55" />
        </span>
        <span className="fb-shot-meta">۸ کامنت</span>
      </div>
      <div className="fb-shot-item">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />۱۶
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w70" />
          <span className="fb-shot-line w45" />
        </span>
        <span className="fb-shot-meta">۳ کامنت</span>
      </div>
      <div className="fb-shot-item">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />۱۱
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w60" />
          <span className="fb-shot-line w35" />
        </span>
        <span className="fb-shot-meta">۱ کامنت</span>
      </div>
    </>
  );
}

function ShotRoadmap() {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">نقشه راه</span>
        <span className="fb-shot-pill">این هفته</span>
      </div>
      <div className="fb-shot-board">
        <div className="fb-shot-col">
          <span className="fb-shot-col-title">در انتظار</span>
          <span className="fb-shot-card-line" />
          <span className="fb-shot-card-line" />
        </div>
        <div className="fb-shot-col is-live">
          <span className="fb-shot-col-title">در حال ساخت</span>
          <span className="fb-shot-card-line" />
          <span className="fb-shot-progress">
            <i />
          </span>
        </div>
        <div className="fb-shot-col">
          <span className="fb-shot-col-title">منتشر شد</span>
          <span className="fb-shot-card-line" />
        </div>
      </div>
    </>
  );
}

function ShotShip() {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">تغییرات</span>
        <span className="fb-shot-pill">نسخه ۲٫۰</span>
      </div>
      <span className="fb-shot-release">پرداخت موبایل درست شد</span>
      <span className="fb-shot-check">
        <i />
        تکمیل پرداخت روی موبایل
      </span>
      <span className="fb-shot-check">
        <i />
        پیام خطای روشن‌تر
      </span>
      <span className="fb-shot-note">این فید‌بک ساخته و منتشر شد</span>
    </>
  );
}

type Chapter = {
  kicker: string;
  title: string;
  body: string;
  url: string;
  accent: "blue" | "violet" | "teal" | "amber" | "green";
  icon: ReactNode;
  scene: ReactNode;
  cta: { kind: "composer"; label: string } | { kind: "link"; href: string; label: string };
};

const CHAPTERS: Chapter[] = [
  {
    kicker: "پرده اول",
    title: "یه چیزی کمه",
    body: "یکی وسط کار به مشکل می‌خوره یا یه ایده به ذهنش می‌رسه. همین جمله کافیه تا ماجرا شروع بشه.",
    url: "vasa.app/feed",
    accent: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.2 18h5.6M10.2 21h3.6" />
        <path d="M12 3a6 6 0 0 0-3.4 10.9c.6.5 1 1.2 1.1 2h4.6c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z" />
      </svg>
    ),
    scene: <ShotStart />,
    cta: { kind: "composer", label: "همین حالا بنویس" },
  },
  {
    kicker: "پرده دوم",
    title: "بنویسش، با جزئیات",
    body: "چند خط توضیح کافیه: چی شده، کجا، و چه انتظاری داری. عکس هم می‌تونی بچسبونی تا موضوع روشن‌تر بشه.",
    url: "vasa.app/new",
    accent: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 19.5l.9-3.6L15 6.3l3.2 3.2L8.6 19.1z" />
        <path d="M13.9 7.4l3.2 3.2" />
      </svg>
    ),
    scene: <ShotWrite />,
    cta: { kind: "link", href: "/feed", label: "بقیه چطور نوشتن" },
  },
  {
    kicker: "پرده سوم",
    title: "بقیه هم همراهش می‌شن",
    body: "کاربرهای دیگه فید‌بک رو می‌خونن، رای می‌دن و کامنت می‌ذارن. هرچی رای بیشتر، شانس دیده شدن هم بیشتر.",
    url: "vasa.app/feed",
    accent: "teal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19.5V6.5" />
        <path d="M6.8 11.7L12 6.5l5.2 5.2" />
      </svg>
    ),
    scene: <ShotVote />,
    cta: { kind: "link", href: "/feed", label: "فید‌بک‌ها و رای‌ها" },
  },
  {
    kicker: "پرده چهارم",
    title: "روی نقشه راه، به زودی",
    body: "نقشه راه هنوز در دست توسعه‌ست، ولی قراره فید‌بک‌هایی که رای بیشتری دارن از انتظار به در حال ساخت و بعد منتشر برن. همین حالا هم وضعیت هر فید‌بک روی خود کارتش معلومه.",
    url: "vasa.app/roadmap",
    accent: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4.5" width="5" height="15" rx="1.6" />
        <rect x="10" y="4.5" width="5" height="9.5" rx="1.6" />
        <rect x="17" y="4.5" width="4" height="12.5" rx="1.6" />
      </svg>
    ),
    scene: <ShotRoadmap />,
    cta: { kind: "link", href: "/roadmap", label: "نقشه راه، به زودی" },
  },
  {
    kicker: "پرده پنجم",
    title: "ساخته می‌شه و منتشر",
    body: "وقتی ساخته و منتشر شد، توی تغییرات با جزئیات می‌بینی چی عوض شده. بعد دوباره می‌تونی فید‌بک بدی و چرخه ادامه پیدا کنه.",
    url: "vasa.app/changelog",
    accent: "green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8.4 12.3l2.4 2.4 4.8-5.2" />
      </svg>
    ),
    scene: <ShotShip />,
    cta: { kind: "link", href: "/changelog", label: "تغییرات منتشرشده" },
  },
];

function probeOffset() {
  return window.innerHeight * (window.matchMedia("(max-width: 900px)").matches ? 0.68 : 0.46);
}

export default function HomeStory() {
  const uid = useId();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const rowRefs = useRef<Array<HTMLLIElement | null>>([]);
  const goalRef = useRef<{ index: number; until: number } | null>(null);
  const pinRef = useRef<{ index: number; top: number; until: number; frame: number; behavior: string } | null>(
    null,
  );
  const scrollFrameRef = useRef(0);
  const measureRef = useRef<((settle: boolean) => void) | null>(null);

  const stopPin = useCallback(() => {
    const pin = pinRef.current;
    if (!pin) return;
    pinRef.current = null;
    window.cancelAnimationFrame(pin.frame);
    document.documentElement.style.scrollBehavior = pin.behavior;
  }, []);

  // Holding the activated header still while its row animates open stops the row
  // collapsing above it from shoving the next chapter into the scroll probe.
  const startPin = useCallback(
    (index: number, top: number) => {
      stopPin();
      const root = document.documentElement;
      const pin = { index, top, until: performance.now() + 520, frame: 0, behavior: root.style.scrollBehavior };
      root.style.scrollBehavior = "auto";
      pinRef.current = pin;

      const step = () => {
        const head = rowRefs.current[index]?.firstElementChild;
        if (!pinRef.current || !(head instanceof HTMLElement)) {
          stopPin();
          return;
        }
        const delta = head.getBoundingClientRect().top - top;
        if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
        if (performance.now() < pin.until) {
          pin.frame = window.requestAnimationFrame(step);
        } else {
          pinRef.current = null;
          root.style.scrollBehavior = pin.behavior;
          window.requestAnimationFrame(() => measureRef.current?.(false));
        }
      };

      pin.frame = window.requestAnimationFrame(step);
    },
    [stopPin],
  );

  useEffect(() => {
    let frame = 0;
    let settleTimer = 0;

    const measure = (settle = true) => {
      frame = 0;
      if (pinRef.current) return;
      const probe = probeOffset();

      const goal = goalRef.current;
      if (goal) {
        if (performance.now() > goal.until) {
          goalRef.current = null;
        } else {
          const goalHead = rowRefs.current[goal.index]?.firstElementChild;
          if (goalHead instanceof HTMLElement) {
            const rect = goalHead.getBoundingClientRect();
            if (Math.abs(rect.top + rect.height / 2 - probe) > 40) return;
          }
          goalRef.current = null;
        }
      }

      let best = -1;
      let bestDistance = Number.POSITIVE_INFINITY;
      let currentDistance = Number.POSITIVE_INFINITY;
      let bestHalf = 0;

      rowRefs.current.forEach((row, index) => {
        const head = row?.firstElementChild;
        if (!(head instanceof HTMLElement)) return;
        const rect = head.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - probe);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
          bestHalf = rect.height / 2;
        }
        if (index === activeRef.current) currentDistance = distance;
      });

      if (best < 0 || best === activeRef.current) return;
      if (bestDistance > currentDistance - 12) return;
      activeRef.current = best;
      setActive(best);
      startPin(best, probe - bestHalf);
      window.clearTimeout(settleTimer);
      if (settle) settleTimer = window.setTimeout(() => measure(false), 620);
    };

    measureRef.current = measure;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => measure());
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(settleTimer);
      if (frame) window.cancelAnimationFrame(frame);
      measureRef.current = null;
      stopPin();
    };
  }, [startPin, stopPin]);

  // Any real scroll input takes over from the pin, so a quick flick still feels native.
  useEffect(() => {
    const release = () => stopPin();
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", release);
      stopPin();
      if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, [stopPin]);

  const scrollToChapter = useCallback((index: number) => {
    if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    const started = performance.now();

    const step = () => {
      const head = rowRefs.current[index]?.firstElementChild;
      if (!(head instanceof HTMLElement)) {
        root.style.scrollBehavior = previousBehavior;
        scrollFrameRef.current = 0;
        return;
      }
      const rect = head.getBoundingClientRect();
      const delta = rect.top + rect.height / 2 - probeOffset();
      if (reduce || performance.now() - started > 640 || Math.abs(delta) < 1.5) {
        window.scrollBy(0, delta);
        root.style.scrollBehavior = previousBehavior;
        scrollFrameRef.current = 0;
        return;
      }
      window.scrollBy(0, delta * 0.16);
      scrollFrameRef.current = window.requestAnimationFrame(step);
    };

    scrollFrameRef.current = window.requestAnimationFrame(step);
  }, []);

  useLayoutEffect(() => {
    if (goalRef.current?.index === active) scrollToChapter(active);
  }, [active, scrollToChapter]);

  function goTo(index: number) {
    if (!rowRefs.current[index]) return;
    stopPin();
    if (index === active) {
      scrollToChapter(index);
      return;
    }
    activeRef.current = index;
    goalRef.current = { index, until: performance.now() + 1600 };
    setActive(index);
  }

  const current = CHAPTERS[active];

  return (
    <section className="fb-section fb-story" aria-labelledby="story-title">
      <div className="fb-section-head">
        <div>
          <p className="fb-eyebrow">داستان یک فید‌بک</p>
          <h2 id="story-title" className="fb-section-title">
            از یک جمله تا یک تغییر واقعی
          </h2>
          <p className="fb-section-sub">
            پنج پرده از مسیر یک فید‌بک، از لحظه‌ای که یه چیزی به ذهنت می‌رسه تا وقتی ساخته و منتشر
            می‌شه. با اسکرول جلو برو.
          </p>
        </div>
      </div>

      <div className="fb-story-grid">
        <ol className="fb-story-track">
          {CHAPTERS.map((chapter, index) => {
            const isActive = index === active;
            return (
              <li
                key={chapter.title}
                ref={(node) => {
                  rowRefs.current[index] = node;
                }}
                data-accent={chapter.accent}
                className={`fb-story-row ${isActive ? "is-active" : ""}`}
              >
                <button
                  type="button"
                  className="fb-story-head"
                  onClick={() => goTo(index)}
                  aria-expanded={isActive}
                  aria-controls={`${uid}-panel-${index}`}
                >
                  <span className="fb-story-icon" aria-hidden="true">
                    {chapter.icon}
                  </span>
                  <span className="fb-story-head-text">
                    <span className="fb-story-step">{chapter.kicker}</span>
                    <span className="fb-story-chapter-title">{chapter.title}</span>
                  </span>
                  <span className="fb-story-chevron" aria-hidden="true" />
                </button>

                <div className="fb-story-reveal" id={`${uid}-panel-${index}`} inert={!isActive}>
                  <div className="fb-story-reveal-inner">
                    <p className="fb-story-chapter-body">{chapter.body}</p>
                    {chapter.cta.kind === "composer" ? (
                      <ComposerButton className="fb-story-link">{chapter.cta.label}</ComposerButton>
                    ) : (
                      <Link href={chapter.cta.href} className="fb-story-link">
                        {chapter.cta.label}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="fb-story-figure">
          <div className="fb-story-stage" data-accent={current.accent}>
            <div className="fb-story-frame">
              <div className="fb-story-bar">
                <span className="fb-story-window" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="fb-story-url" dir="ltr">
                  {current.url}
                </span>
              </div>
              <div className="fb-story-screen" aria-hidden="true">
                {CHAPTERS.map((chapter, index) => (
                  <div
                    key={chapter.title}
                    className={`fb-story-shot ${index === active ? "is-active" : ""}`}
                  >
                    {chapter.scene}
                  </div>
                ))}
              </div>
            </div>

            <div className="fb-story-meter" role="group" aria-label="پرده‌های داستان">
              <div className="fb-story-dots">
                {CHAPTERS.map((chapter, index) => (
                  <button
                    key={chapter.kicker}
                    type="button"
                    className={`fb-story-dot ${index === active ? "active" : ""} ${
                      index < active ? "done" : ""
                    }`}
                    onClick={() => goTo(index)}
                    aria-label={`رفتن به ${chapter.kicker}`}
                    aria-current={index === active ? "step" : undefined}
                  >
                    {faNumber(index + 1)}
                  </button>
                ))}
              </div>
              <span className="fb-story-meter-label">
                {current.kicker} از {faNumber(CHAPTERS.length)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
