"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
      <div className="fb-shot-field is-grow">
        <span className="fb-shot-label">توضیح</span>
        <span className="fb-shot-box">
          <span className="fb-shot-line w90" />
          <span className="fb-shot-line w75" />
          <span className="fb-shot-line w85" />
          <span className="fb-shot-line w55" />
        </span>
      </div>
      <div className="fb-shot-chips">
        <span className="fb-shot-chip">فروشگاه</span>
        <span className="fb-shot-chip is-soft">موبایل</span>
      </div>
      <span className="fb-shot-btn">فیدبک بده</span>
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
      <div className="fb-shot-item is-tall">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />۲۴
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w85" />
          <span className="fb-shot-line w55" />
        </span>
        <span className="fb-shot-meta">۸ کامنت</span>
      </div>
      <div className="fb-shot-item is-tall">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />۱۶
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w70" />
          <span className="fb-shot-line w45" />
        </span>
        <span className="fb-shot-meta">۳ کامنت</span>
      </div>
      <div className="fb-shot-item is-tall">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />۱۱
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w60" />
          <span className="fb-shot-line w35" />
        </span>
        <span className="fb-shot-meta">۱ کامنت</span>
      </div>
      <div className="fb-shot-item is-tall">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />۸
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w75" />
          <span className="fb-shot-line w40" />
        </span>
        <span className="fb-shot-meta">۲ کامنت</span>
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
          <span className="fb-shot-card">
            <i className="fb-shot-line w85" />
            <i className="fb-shot-line w55" />
          </span>
          <span className="fb-shot-card">
            <i className="fb-shot-line w70" />
            <i className="fb-shot-line w45" />
          </span>
          <span className="fb-shot-card">
            <i className="fb-shot-line w60" />
            <i className="fb-shot-line w35" />
          </span>
        </div>
        <div className="fb-shot-col is-live">
          <span className="fb-shot-col-title">در حال ساخت</span>
          <span className="fb-shot-card">
            <i className="fb-shot-line w80" />
            <i className="fb-shot-line w50" />
          </span>
          <span className="fb-shot-card">
            <i className="fb-shot-line w65" />
            <i className="fb-shot-line w40" />
          </span>
          <span className="fb-shot-progress">
            <i />
          </span>
        </div>
        <div className="fb-shot-col">
          <span className="fb-shot-col-title">منتشر شد</span>
          <span className="fb-shot-card">
            <i className="fb-shot-line w75" />
            <i className="fb-shot-line w45" />
          </span>
          <span className="fb-shot-card">
            <i className="fb-shot-line w60" />
            <i className="fb-shot-line w35" />
          </span>
          <span className="fb-shot-card">
            <i className="fb-shot-line w50" />
            <i className="fb-shot-line w30" />
          </span>
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
      <div className="fb-shot-release-block">
        <span className="fb-shot-release">پرداخت موبایل درست شد</span>
        <span className="fb-shot-release-meta">از فید‌بک پررای «دکمه پرداخت»</span>
      </div>
      <span className="fb-shot-check">
        <i />
        تکمیل پرداخت روی موبایل
      </span>
      <span className="fb-shot-check">
        <i />
        پیام خطای روشن‌تر
      </span>
      <span className="fb-shot-check">
        <i />
        حفظ سبد خرید بعد از ورود
      </span>
      <span className="fb-shot-check">
        <i />
        نمایش وضعیت سفارش در پروفایل
      </span>
      <div className="fb-shot-versions">
        <span className="fb-shot-version">
          <span>نسخه ۱٫۹</span>
          <i />
        </span>
        <span className="fb-shot-version">
          <span>نسخه ۱٫۸</span>
          <i />
        </span>
      </div>
      <span className="fb-shot-note">این فید‌بک ساخته و منتشر شد</span>
    </>
  );
}

type Chapter = {
  title: string;
  body: string;
  url: string;
  accent: "blue" | "violet" | "rose" | "amber" | "green";
  icon: ReactNode;
  scene: ReactNode;
  cta: { kind: "composer"; label: string } | { kind: "link"; href: string; label: string };
};

const CHAPTERS: Chapter[] = [
  {
    title: "یه چیزی کمه",
    body: "یه مشکل، ایده یا جای بهتر شدن پیدا کردی؟ همون اول ماجراست. لازم نیست متن آماده داشته باشی.",
    url: "vasa.app/feed",
    accent: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.2 18h5.6M10.2 21h3.6" />
        <path d="M12 3a6 6 0 0 0-3.4 10.9c.6.5 1 1.2 1.1 2h4.6c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z" />
      </svg>
    ),
    scene: <ShotStart />,
    cta: { kind: "composer", label: "فید‌بک بده" },
  },
  {
    title: "می‌نویسی",
    body: "چی شد و چی می‌خوای رو بنویس. یه عنوان روشن و دو سه خط توضیح کافیه تا بقیه سریع بفهمن.",
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
    title: "رای می‌گیره",
    body: "بقیه می‌خونن، رای می‌دن و کامنت می‌ذارن. هرچی رای بیشتر، فید‌بک زودتر بررسی می‌شه.",
    url: "vasa.app/feed",
    accent: "rose",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19.5V6.5" />
        <path d="M6.8 11.7L12 6.5l5.2 5.2" />
      </svg>
    ),
    scene: <ShotVote />,
    cta: { kind: "link", href: "/feed", label: "فید‌بک‌ها" },
  },
  {
    title: "می‌ره روی نقشه راه",
    body: "فید‌بک‌های پررای وارد نقشه راه می‌شن. می‌بینی چی قبول شده، چی داره ساخته می‌شه و چی منتشر شده.",
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
    cta: { kind: "link", href: "/roadmap", label: "نقشه راه" },
  },
  {
    title: "منتشر می‌شه",
    body: "وقتی ساخته شد، توی تغییرات می‌بینی کدوم فید‌بک باعثش شده. مسیر از ایده تا انتشار شفاف می‌مونه.",
    url: "vasa.app/changelog",
    accent: "green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8.4 12.3l2.4 2.4 4.8-5.2" />
      </svg>
    ),
    scene: <ShotShip />,
    cta: { kind: "link", href: "/changelog", label: "تغییرات" },
  },
];

function probeOffset() {
  return window.innerHeight * (window.matchMedia("(max-width: 900px)").matches ? 0.68 : 0.46);
}

// Heads park under the pinned preview on small screens, so their own rect no longer tracks
// the row. Measuring from the row keeps activation on the chapter's flow position.
function chapterCenter(row: HTMLLIElement | null) {
  const head = row?.firstElementChild;
  if (!row || !(head instanceof HTMLElement)) return null;
  return row.getBoundingClientRect().top + head.offsetHeight / 2;
}

export default function HomeStory() {
  const uid = useId();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const activeRef = useRef(0);
  const rowRefs = useRef<Array<HTMLLIElement | null>>([]);
  const goalRef = useRef<{ index: number; until: number } | null>(null);
  const scrollFrameRef = useRef(0);
  const stopScrollRef = useRef<(() => void) | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const figureRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;
    let settleTimer = 0;

    const syncPin = () => {
      const grid = gridRef.current;
      const figure = figureRef.current;
      const stage = stageRef.current;
      if (!grid || !figure || !stage) return;

      if (!window.matchMedia("(max-width: 900px)").matches) {
        if (figure.style.top) figure.style.top = "";
        if (grid.dataset.pinned !== "false") grid.dataset.pinned = "false";
        return;
      }

      const baseTop =
        Number.parseFloat(getComputedStyle(grid).getPropertyValue("--story-figure-top")) || 72;
      const stageHeight = stage.offsetHeight;
      const lastRow = rowRefs.current[rowRefs.current.length - 1];
      const lastHead = lastRow?.firstElementChild;
      // The track ends before the preview would release, which used to squeeze the final title
      // out from under it. Carrying the stage up with the last row keeps that title attached.
      const release =
        lastRow && lastHead instanceof HTMLElement
          ? lastRow.getBoundingClientRect().bottom - lastHead.offsetHeight - stageHeight
          : baseTop;
      const stageTop = Math.round(Math.min(baseTop, release));
      const topValue = `${stageTop}px`;
      if (figure.style.top !== topValue) figure.style.top = topValue;

      const pin = `${stageTop + stageHeight}px`;
      if (grid.style.getPropertyValue("--story-head-pin") !== pin) {
        grid.style.setProperty("--story-head-pin", pin);
      }

      const pinned = figure.getBoundingClientRect().top <= baseTop + 1;
      const next = pinned ? "true" : "false";
      if (grid.dataset.pinned !== next) grid.dataset.pinned = next;
    };

    const measure = (settle = true) => {
      frame = 0;
      syncPin();
      const probe = probeOffset();

      const goal = goalRef.current;
      if (goal) {
        if (performance.now() > goal.until) {
          goalRef.current = null;
        } else {
          const goalCenter = chapterCenter(rowRefs.current[goal.index]);
          if (goalCenter !== null && Math.abs(goalCenter - probe) > 40) return;
          goalRef.current = null;
        }
      }

      let best = -1;
      let bestDistance = Number.POSITIVE_INFINITY;
      let currentDistance = Number.POSITIVE_INFINITY;

      rowRefs.current.forEach((row, index) => {
        const head = row?.firstElementChild;
        if (!row || !(head instanceof HTMLElement)) return;
        const rowTop = row.getBoundingClientRect().top;
        const center = rowTop + head.offsetHeight / 2;
        // A displaced head is either parked under the preview or handing over to the next row,
        // and only then does it need its own paper backdrop.
        const stuck = head.getBoundingClientRect().top > rowTop + 1 ? "true" : "false";
        if (head.dataset.stuck !== stuck) head.dataset.stuck = stuck;
        const distance = Math.abs(center - probe);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
        if (index === activeRef.current) currentDistance = distance;
      });

      if (best < 0 || best === activeRef.current) return;
      if (bestDistance > currentDistance - 12) return;
      setDirection(best > activeRef.current ? "down" : "up");
      activeRef.current = best;
      setActive(best);
      window.clearTimeout(settleTimer);
      if (settle) settleTimer = window.setTimeout(() => measure(false), 620);
    };

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
    };
  }, []);

  const scrollToChapter = useCallback((index: number) => {
    stopScrollRef.current?.();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();

    const stop = () => {
      if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = 0;
      stopScrollRef.current = null;
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    };

    // The chapter that opens changes the height above the target while it animates, so the
    // scroll keeps re-centering until the handover is done instead of stopping on the first
    // frame that happens to line up. A wheel or touch hands control straight back.
    const step = () => {
      const center = chapterCenter(rowRefs.current[index]);
      if (center === null) {
        stop();
        return;
      }
      const delta = center - probeOffset();
      const done = reduce || performance.now() - started > 700;
      window.scrollTo({ top: window.scrollY + (done ? delta : delta * 0.18), behavior: "instant" });
      if (done) {
        stop();
        return;
      }
      scrollFrameRef.current = window.requestAnimationFrame(step);
    };

    stopScrollRef.current = stop;
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    scrollFrameRef.current = window.requestAnimationFrame(step);
  }, []);

  useEffect(() => () => stopScrollRef.current?.(), []);

  useLayoutEffect(() => {
    if (goalRef.current?.index === active) scrollToChapter(active);
  }, [active, scrollToChapter]);

  function goTo(index: number) {
    if (!rowRefs.current[index]) return;
    if (index === active) {
      scrollToChapter(index);
      return;
    }
    activeRef.current = index;
    goalRef.current = { index, until: performance.now() + 1600 };
    setDirection(index > active ? "down" : "up");
    setActive(index);
  }

  const current = CHAPTERS[active];

  return (
    <section className="fb-section fb-story" aria-labelledby="story-title">
      <div className="fb-section-head">
        <div>
          <h2 id="story-title" className="fb-section-title">
            از یک جمله تا یک تغییر واقعی
          </h2>
          <p className="fb-section-sub">با اسکرول، مسیر یه فید‌بک رو ببین: از نوشتن تا انتشار.</p>
        </div>
      </div>

      <div className="fb-story-grid" ref={gridRef}>
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

        <div className="fb-story-figure" ref={figureRef}>
          <div
            className="fb-story-stage"
            ref={stageRef}
            data-accent={current.accent}
            data-dir={direction}
          >
            <div className="fb-story-frame" data-tilt>
              <div className="fb-story-bar">
                <span className="fb-story-window" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="fb-story-url" dir="ltr">
                  <span key={current.url} className="fb-story-url-text">
                    {current.url}
                  </span>
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
          </div>
        </div>
      </div>
    </section>
  );
}
