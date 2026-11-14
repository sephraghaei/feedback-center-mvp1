"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { faNumber } from "@/lib/feedback/labels";

type Variant = { selector: string; title: string; body: string; expand?: "section-head" };
type StepDef = { id: string; variants: Variant[]; final?: boolean };
type ResolvedStep = { id: string; title: string; body: string; el: HTMLElement; final: boolean };
type Box = { top: number; left: number; width: number; height: number };
type Placement = { top: number; left: number; dock: boolean };

const STEPS: StepDef[] = [
  {
    id: "nav",
    variants: [
      {
        selector: ".site-nav",
        title: "همه‌جا در دسترس",
        body: "از همین منو بین بازخوردها، نقشه راه و تغییرات جابه‌جا شو. اگه وارد شده باشی، درخواست‌های من هم به منو اضافه می‌شه.",
      },
    ],
  },
  {
    id: "intro",
    variants: [
      {
        selector: ".fb-home .fb-hero-inner",
        title: "قلب مرکز بازخورد",
        body: "اینجا بازخورد بده، آمار رو ببین و سراغ تازه‌ترین‌ها برو. کارت‌های کنار صفحه هم نمونه‌ی واقعی بازخوردها هستن؛ بهشون رای بده و ببین چی می‌شه.",
      },
      {
        selector: ".fb-page .fb-hero",
        title: "خوش اومدی",
        body: "اینجا خلاصه‌ی این بخش و کارهای اصلی‌شه. با دکمه‌های همین‌جا سریع بین بخش‌ها جابه‌جا می‌شی.",
      },
    ],
  },
  {
    id: "content",
    variants: [
      {
        selector: "#recent-title",
        expand: "section-head",
        title: "تازه‌ترین بازخوردها",
        body: "هر بازخورد یه کارت داره: بخونش، رای بده و ببین بقیه چی می‌گن. رای‌ها معلوم می‌کنن چی اولویت داره.",
      },
      {
        selector: ".fb-toolbar-row",
        title: "فیلتر کن، پیدا کن",
        body: "از فیلترها استفاده کن تا دقیقاً همون دسته یا وضعیتی که می‌خوای رو ببینی.",
      },
      {
        selector: ".fb-entry-list",
        title: "تغییرات منتشر شده",
        body: "هر تغییر می‌گه کدوم بازخوردها رو حل کرده. از همین‌جا ردش رو می‌گیری.",
      },
      {
        selector: ".fb-page .fb-entry",
        title: "تغییرات منتشر شده",
        body: "هر تغییر می‌گه کدوم بازخوردها رو حل کرده. از همین‌جا ردش رو می‌گیری.",
      },
      {
        selector: ".fb-board",
        title: "نقشه راه",
        body: "هر درخواست تو یه ستونه: تو نوبت، در حال انجام، یا منتشر شده.",
      },
      {
        selector: ".fb-grid",
        title: "بازخوردها",
        body: "روی هر کارت بزن تا جزئیات و مسیرش رو ببینی و رای بدی.",
      },
    ],
  },
  {
    id: "roadmap",
    variants: [
      {
        selector: "#roadmap-title",
        expand: "section-head",
        title: "مسیر رو دنبال کن",
        body: "از این‌جا می‌بینی هر درخواست کجای مسیره. چیزی که منتشر می‌شه، به تغییرات هم می‌رسه.",
      },
    ],
  },
  {
    id: "account",
    variants: [
      {
        selector: "#account-title",
        expand: "section-head",
        title: "حساب، بدون رمز",
        body: "با شماره موبایل یا ایمیل وارد شو. بعدش درخواست‌هات یه جا جمع می‌شن و وضعیتشون رو می‌بینی.",
      },
    ],
  },
  {
    id: "compose",
    final: true,
    variants: [
      {
        selector: ".fb-compose-btn",
        title: "حالا نوبت توئه",
        body: "هر وقت خواستی بازخورد بدی، از همین دکمه شروع کن. مسیرش رو تا انتشار دنبال می‌کنیم.",
      },
    ],
  },
];

function resolveSteps(): ResolvedStep[] {
  const resolved: ResolvedStep[] = [];
  for (const def of STEPS) {
    for (const variant of def.variants) {
      const base = document.querySelector<HTMLElement>(variant.selector);
      if (!base) continue;
      const el =
        variant.expand === "section-head"
          ? base.closest<HTMLElement>(".fb-section-head") ?? base
          : base;
      resolved.push({
        id: def.id,
        title: variant.title,
        body: variant.body,
        el,
        final: Boolean(def.final),
      });
      break;
    }
  }
  return resolved;
}

function sameBox(a: Box, b: Box): boolean {
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

export default function SiteTour() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<ResolvedStep[]>([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Box | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [viewportTick, setViewportTick] = useState(0);
  const tipRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const start = useCallback(() => {
    const next = resolveSteps();
    if (!next.length) return;
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSteps(next);
    setIndex(0);
    setRect(null);
    setPlacement(null);
    setActive(true);
  }, []);

  const close = useCallback((focusBack = true) => {
    setActive(false);
    setRect(null);
    setPlacement(null);
    try {
      window.localStorage.setItem("fc-tour", "done");
    } catch {
      // Private mode can block storage; the tour still closes.
    }
    const target = restoreRef.current;
    if (focusBack && target && target.isConnected) {
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
  }, []);

  const goNext = useCallback(() => {
    setIndex((value) => Math.min(value + 1, steps.length - 1));
  }, [steps.length]);

  const goPrev = useCallback(() => {
    setIndex((value) => Math.max(value - 1, 0));
  }, []);

  useEffect(() => {
    window.addEventListener("fc:start-tour", start);
    return () => window.removeEventListener("fc:start-tour", start);
  }, [start]);

  useEffect(() => {
    if (pathname !== "/") return;
    let seen = false;
    try {
      seen = Boolean(window.localStorage.getItem("fc-tour"));
    } catch {
      seen = false;
    }
    if (seen) return;
    if (window.location.hash || /(?:^|[?&])next=/.test(window.location.search)) return;

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const timer = window.setTimeout(() => {
      if (cancelled || document.visibilityState === "hidden" || window.scrollY > 40) return;
      try {
        window.localStorage.setItem("fc-tour", "done");
      } catch {
        // Storage is optional; the tour can still run once per load.
      }
      start();
    }, 1400);

    window.addEventListener("fc:open-composer", cancel, { once: true });
    window.addEventListener("pointerdown", cancel, { once: true, passive: true });
    window.addEventListener("keydown", cancel, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("fc:open-composer", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [pathname, start]);

  useEffect(() => {
    const onResize = () => setViewportTick((value) => value + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!active) return;
    const next = resolveSteps();
    if (!next.length) {
      close(false);
      return;
    }
    setSteps(next);
    setIndex((value) => Math.min(value, next.length - 1));
  }, [active, pathname, close]);

  useEffect(() => {
    if (!active) return;
    const step = steps[index];
    if (!step) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    step.el.scrollIntoView({ block: "center", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [active, steps, index]);

  useEffect(() => {
    if (!active) return;
    const step = steps[index];
    if (!step) return;

    let frame = 0;
    const track = () => {
      const el = step.el;
      if (el.isConnected) {
        const box = el.getBoundingClientRect();
        const pad = 8;
        const next: Box = {
          top: Math.max(6, box.top - pad),
          left: Math.max(6, box.left - pad),
          width: Math.max(0, Math.min(window.innerWidth - 6, box.right + pad) - Math.max(6, box.left - pad)),
          height: Math.max(0, Math.min(window.innerHeight - 6, box.bottom + pad) - Math.max(6, box.top - pad)),
        };
        setRect((prev) => (prev && sameBox(prev, next) ? prev : next));
      }
      frame = requestAnimationFrame(track);
    };

    frame = requestAnimationFrame(track);
    return () => cancelAnimationFrame(frame);
  }, [active, steps, index]);

  useEffect(() => {
    if (!active) return;
    tipRef.current?.focus({ preventScroll: true });
  }, [active, index]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key !== "Tab") return;

      const tip = tipRef.current;
      if (!tip) return;
      const focusables = Array.from(
        tip.querySelectorAll<HTMLElement>(
          "button:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
        ),
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || current === tip)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, close, goNext, goPrev]);

  useLayoutEffect(() => {
    if (!active || !rect) return;
    const tip = tipRef.current;
    if (!tip) return;

    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    const dock = viewWidth <= 720 || rect.height > viewHeight * 0.5;

    if (dock) {
      setPlacement((prev) => (prev?.dock ? prev : { top: 0, left: 0, dock: true }));
      return;
    }

    const gap = 14;
    const edge = 12;
    const spaceBelow = viewHeight - (rect.top + rect.height) - gap - edge;
    const spaceAbove = rect.top - gap - edge;
    const placeBelow = spaceBelow >= height || spaceBelow >= spaceAbove;
    const top = placeBelow
      ? rect.top + rect.height + gap
      : Math.max(edge, rect.top - height - gap);
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, edge),
      Math.max(edge, viewWidth - width - edge),
    );

    setPlacement((prev) =>
      prev && !prev.dock && Math.abs(prev.top - top) < 0.5 && Math.abs(prev.left - left) < 0.5
        ? prev
        : { top, left, dock: false },
    );
  }, [active, rect, index, steps, viewportTick]);

  const finish = () => {
    close(false);
    window.dispatchEvent(new Event("fc:open-composer"));
  };

  const step = steps[index];
  if (!active || !step) return null;

  const total = steps.length;

  return (
    <div className="fb-tour" role="presentation">
      {rect ? (
        <>
          <div className="fb-tour-block" style={{ top: 0, left: 0, right: 0, height: rect.top }} />
          <div
            className="fb-tour-block"
            style={{ top: rect.top + rect.height, left: 0, right: 0, bottom: 0 }}
          />
          <div
            className="fb-tour-block"
            style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }}
          />
          <div
            className="fb-tour-block"
            style={{ top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }}
          />
          <div
            className="fb-tour-hole"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="fb-tour-block" style={{ inset: 0 }} />
      )}

      <div
        key={index}
        ref={tipRef}
        className={`fb-tour-tip ${placement?.dock ? "is-dock" : ""}`}
        style={placement && !placement.dock ? { top: placement.top, left: placement.left } : undefined}
        data-ready={placement ? "true" : "false"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-tour-title"
        aria-describedby="fb-tour-body"
        tabIndex={-1}
      >
        <div className="fb-tour-top">
          <span className="fb-tour-step">
            {faNumber(index + 1)} از {faNumber(total)}
          </span>
          <button
            type="button"
            className="fb-tour-close"
            onClick={() => close()}
            aria-label="بستن آموزش"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="fb-tour-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${(index + 1) / total})` }} />
        </div>

        <h2 id="fb-tour-title" className="fb-tour-title">
          {step.title}
        </h2>
        <p id="fb-tour-body" className="fb-tour-body">
          {step.body}
        </p>

        <div className="fb-tour-actions">
          <button
            type="button"
            className="fb-btn fb-btn-ghost"
            onClick={goPrev}
            disabled={index === 0}
          >
            قبلی
          </button>
          {step.final ? (
            <button type="button" className="fb-btn fb-btn-primary" onClick={finish}>
              بریم بنویسیم
            </button>
          ) : (
            <button type="button" className="fb-btn fb-btn-primary" onClick={goNext}>
              بعدی
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
