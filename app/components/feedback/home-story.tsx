"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useT } from "@/lib/i18n/client";
import type { T } from "@/lib/i18n/locale";

function ShotStart({ t }: { t: T }) {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">{t("بردهای وسا", "Vasa boards")}</span>
        <span className="fb-shot-pill">{t("جدید", "New")}</span>
      </div>
      <div className="fb-shot-item is-ghost">
        <span className="fb-shot-num">1</span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w80" />
          <span className="fb-shot-line w50" />
        </span>
      </div>
      <div className="fb-shot-item is-ghost">
        <span className="fb-shot-num">2</span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w65" />
          <span className="fb-shot-line w40" />
        </span>
      </div>
      <div className="fb-shot-empty">
        <span className="fb-shot-plus" />
        <strong>{t("هنوز فیدبکی نیست", "No feedback yet")}</strong>
        <span>{t("هر برد با یک جمله صادقانه شروع می‌شه", "Every board starts with one honest note")}</span>
      </div>
    </>
  );
}

function ShotWrite({ t }: { t: T }) {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">{t("فیدبک تازه", "New feedback")}</span>
        <span className="fb-shot-pill">{t("پیش‌نویس", "Draft")}</span>
      </div>
      <div className="fb-shot-field">
        <span className="fb-shot-label">{t("عنوان", "Title")}</span>
        <span className="fb-shot-input">{t("دکمه پرداخت روی موبایل کار نمی‌کنه", "Checkout button breaks on mobile")}</span>
      </div>
      <div className="fb-shot-field is-grow">
        <span className="fb-shot-label">{t("توضیحات", "Details")}</span>
        <span className="fb-shot-box">
          <span className="fb-shot-line w90" />
          <span className="fb-shot-line w75" />
          <span className="fb-shot-line w85" />
          <span className="fb-shot-line w55" />
        </span>
      </div>
      <div className="fb-shot-chips">
        <span className="fb-shot-chip">{t("فروشگاه", "Storefront")}</span>
        <span className="fb-shot-chip is-soft">{t("موبایل", "Mobile")}</span>
      </div>
      <span className="fb-shot-btn">{t("ثبت فیدبک", "Post feedback")}</span>
    </>
  );
}

function ShotVote({ t }: { t: T }) {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">{t("بردهای وسا", "Vasa boards")}</span>
        <span className="fb-shot-pill">{t("پررأی‌ترین", "Top voted")}</span>
      </div>
      <div className="fb-shot-item is-tall">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />
          <span className="fb-shot-count">24</span>
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w85" />
          <span className="fb-shot-line w55" />
        </span>
        <span className="fb-shot-meta">{t("۸ کامنت", "8 comments")}</span>
      </div>
      <div className="fb-shot-item is-tall">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />
          <span className="fb-shot-count">16</span>
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w70" />
          <span className="fb-shot-line w45" />
        </span>
        <span className="fb-shot-meta">{t("۳ کامنت", "3 comments")}</span>
      </div>
      <div className="fb-shot-item is-tall">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />
          <span className="fb-shot-count">11</span>
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w60" />
          <span className="fb-shot-line w35" />
        </span>
        <span className="fb-shot-meta">{t("۱ کامنت", "1 comment")}</span>
      </div>
      <div className="fb-shot-item is-tall">
        <span className="fb-shot-vote">
          <span className="fb-shot-arrow" />
          <span className="fb-shot-count">8</span>
        </span>
        <span className="fb-shot-lines">
          <span className="fb-shot-line w75" />
          <span className="fb-shot-line w40" />
        </span>
        <span className="fb-shot-meta">{t("۲ کامنت", "2 comments")}</span>
      </div>
    </>
  );
}

function ShotPlan({ t }: { t: T }) {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">{t("نقشه راه", "Roadmap")}</span>
        <span className="fb-shot-pill">{t("عمومی", "Public")}</span>
      </div>
      <div className="fb-shot-board">
        <div className="fb-shot-col">
          <span className="fb-shot-col-title">{t("برنامه‌ریزی شده", "Planned")}</span>
          <span className="fb-shot-card">
            <i />
            <i />
          </span>
          <span className="fb-shot-card">
            <i />
            <i />
          </span>
        </div>
        <div className="fb-shot-col is-live">
          <span className="fb-shot-col-title">{t("در حال ساخت", "Building")}</span>
          <span className="fb-shot-card">
            <i />
            <i />
          </span>
          <span className="fb-shot-progress">
            <i />
          </span>
        </div>
        <div className="fb-shot-col">
          <span className="fb-shot-col-title">{t("منتشر شده", "Shipped")}</span>
          <span className="fb-shot-card">
            <i />
            <i />
          </span>
        </div>
      </div>
    </>
  );
}

function ShotRelease({ t }: { t: T }) {
  return (
    <>
      <div className="fb-shot-head">
        <span className="fb-shot-brand">{t("تغییرات", "Updates")}</span>
        <span className="fb-shot-pill">{t("نسخه ۳٫۲", "v3.2")}</span>
      </div>
      <div className="fb-shot-release-block">
        <span className="fb-shot-release">{t("حالت تاریک فعال شد", "Dark mode is live")}</span>
        <span className="fb-shot-release-meta">
          {t("امروز منتشر شد، ۲ فیدبک بسته شد", "Published today, 2 feedback items closed")}
        </span>
      </div>
      <div className="fb-shot-check">
        <i />
        <span>{t("حالت تاریک در کل برد عمومی", "Dark mode across the public board")}</span>
      </div>
      <div className="fb-shot-check">
        <i />
        <span>{t("فیلترهای ذخیره‌شده برای هر برد", "Saved filters per board")}</span>
      </div>
      <div className="fb-shot-versions">
        <div className="fb-shot-version">
          <span>{t("نسخه ۳٫۱", "v3.1")}</span>
          <i />
        </div>
        <div className="fb-shot-version">
          <span>{t("نسخه ۳٫۰", "v3.0")}</span>
          <i />
        </div>
      </div>
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
  href: string;
  cta: string;
};

function chapterLinks(slug?: string) {
  const board = slug ? `/c/${slug}` : "#boards";
  const site = slug ? `vasa.app/c/${slug}` : "vasa.app";
  return {
    board,
    newPost: slug ? `${board}/new` : "#boards",
    roadmap: slug ? `${board}/roadmap` : "/workspace",
    updates: slug ? `${board}/updates` : "/workspace",
    urlBoard: site,
    urlNewPost: `${site}/new`,
    urlRoadmap: slug ? `${site}/roadmap` : "vasa.app/workspace",
    urlUpdates: slug ? `${site}/updates` : "vasa.app/workspace",
  };
}

function buildChapters(t: T, slug?: string): Chapter[] {
  const links = chapterLinks(slug);
  return [
    {
      title: t("یک جای خالی پیدا می‌شه", "A gap shows up"),
      body: t(
        "مشتری به یک باگ، یک قابلیت نبوده یا یک راه بهتر برمی‌خوره. حلقه از همین‌جا شروع می‌شه و برای شروع هیچ پیش‌نویسی لازم نیست.",
        "A customer hits a bug, a missing feature or a better way. That is where the loop starts, and no draft is needed to begin.",
      ),
      url: links.urlBoard,
      accent: "blue",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.2 18h5.6M10.2 21h3.6" />
          <path d="M12 3a6 6 0 0 0-3.4 10.9c.6.5 1 1.2 1.1 2h4.6c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z" />
        </svg>
      ),
      scene: <ShotStart t={t} />,
      href: links.newPost,
      cta: t("با یک جمله شروع کن", "Start with a note"),
    },
    {
      title: t("بنویسش", "Write it down"),
      body: t(
        "یک عنوان روشن و دو خط توضیح کافیه تا همه روی برد بفهمن چی شده و چی می‌خوای.",
        "A clear title and two lines of detail are enough for everyone on the board to understand what happened and what you want.",
      ),
      url: links.urlNewPost,
      accent: "violet",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 19.5l.9-3.6L15 6.3l3.2 3.2L8.6 19.1z" />
          <path d="M13.9 7.4l3.2 3.2" />
        </svg>
      ),
      scene: <ShotWrite t={t} />,
      href: links.board,
      cta: t("ببین بقیه چی نوشتن", "See what others wrote"),
    },
    {
      title: t("رأی‌ها تصمیم می‌گیرن", "Votes decide"),
      body: t(
        "مشتری‌ها رأی می‌دن و کامنت می‌ذارن، تا تیم ببینه چی برای بیشترین آدم مهم‌تره، نه فقط چی بلندتر صداش میاد.",
        "Customers vote and comment, so the team sees what matters most to the most people, not just what is loudest.",
      ),
      url: links.urlBoard,
      accent: "rose",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19.5V6.5" />
          <path d="M6.8 11.7L12 6.5l5.2 5.2" />
        </svg>
      ),
      scene: <ShotVote t={t} />,
      href: links.board,
      cta: t("برد رو باز کن", "Open the board"),
    },
    {
      title: t("تیم برنامه می‌ریزه", "The team plans"),
      body: t(
        "بررسی، نوشته رو روی نقشه راه عمومی جلو می‌بره و وضعیت برای همه‌ی دنبال‌کننده‌ها عوض می‌شه.",
        "Triage moves the note along a public roadmap, and the status changes for everyone watching it.",
      ),
      url: links.urlRoadmap,
      accent: "amber",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="4.6" height="9" rx="1.3" />
          <rect x="9.7" y="4" width="4.6" height="16" rx="1.3" />
          <rect x="15.4" y="4" width="4.6" height="6" rx="1.3" />
        </svg>
      ),
      scene: <ShotPlan t={t} />,
      href: links.roadmap,
      cta: t("نقشه راه رو ببین", "Walk the roadmap"),
    },
    {
      title: t("منتشر می‌شه", "It ships"),
      body: t(
        "یک تغییر، حلقه رو کامل می‌کنه: تغییرات منتشرشده فیدبک‌های وصل‌شده رو «منتشر شده» می‌کنن و مشتری‌ها خبردار می‌شن.",
        "A release note closes the loop: published updates mark the linked feedback as shipped and subscribers hear about it.",
      ),
      url: links.urlUpdates,
      accent: "green",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8.4" />
          <path d="M8.4 12.2l2.5 2.5 4.9-5.2" />
        </svg>
      ),
      scene: <ShotRelease t={t} />,
      href: links.updates,
      cta: t("تغییرات رو بخون", "Read the updates"),
    },
  ];
}

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

export default function HomeStory({ slug }: { slug?: string }) {
  const t = useT();
  const uid = useId();
  const chapters = buildChapters(t, slug);
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

  const current = chapters[active];

  return (
    <section className="fb-section fb-story" aria-labelledby="story-title">
      <div className="fb-section-head" data-reveal>
        <div>
          <h2 id="story-title" className="fb-section-title">
            {t("از اولین جمله تا یک انتشار واقعی", "From a first note to a shipped release")}
          </h2>
          <p className="fb-section-sub">
            {t(
              "با اسکرول داستان رو ببین: یک فیدبک از نوشتن تا رأی گرفتن، برنامه‌ریزی و انتشار.",
              "Scroll the story: one piece of feedback as it is written, voted on, planned and shipped.",
            )}
          </p>
          <div className="fb-story-meter" aria-hidden="true">
            {chapters.map((chapter, index) => (
              <span
                key={chapter.title}
                data-accent={chapter.accent}
                className={index === active ? "is-on" : ""}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fb-story-grid" ref={gridRef}>
        <ol className="fb-story-track">
          {chapters.map((chapter, index) => {
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
                    <Link href={chapter.href} className="fb-story-link">
                      {chapter.cta}
                    </Link>
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
            <span key={active} className="fb-story-beam" aria-hidden="true" />
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
                {chapters.map((chapter, index) => (
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
