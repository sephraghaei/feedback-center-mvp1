"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { formatNumber } from "@/lib/feedback/labels";
import { CloseIcon } from "./icons";

type StepDef = {
  id: string;
  title: string;
  body: string;
  selector: string;
  route?: string | (() => string | null);
  final?: boolean;
  optional?: boolean;
  noScroll?: boolean;
};

type Box = { top: number; left: number; width: number; height: number };
type Placement = { top: number; left: number; dock: boolean };

const SEEN_KEY = "fc-tour";
const AUTO_ROUTES = new Set(["/", "/feed"]);

function firstPostHref(): string | null {
  const link = document.querySelector<HTMLAnchorElement>('.fb-grid a[href^="/p/"]');
  return link?.getAttribute("href") ?? null;
}

function postRoute(): string | null {
  const fromFeed = firstPostHref();
  if (fromFeed) return fromFeed;
  const path = window.location.pathname;
  return path.startsWith("/p/") ? path : null;
}

const STEPS: StepDef[] = [
  {
    id: "nav",
    selector: ".site-nav",
    noScroll: true,
    title: "یه دور کامل، از اول تا آخر",
    body: "کل مسیر سایت از همین منو می‌گذره: فید‌بک‌ها، نوشتن فید‌بک تازه و حساب کاربری. با هم یه دور کامل رو ببینیم.",
  },
  {
    id: "feed",
    selector: ".fb-grid",
    route: "/feed",
    optional: true,
    title: "اول، فید‌بک‌ها رو بخون",
    body: "هر کارت یه فید‌بک واقعیه؛ بخونش و ببین چند نفر رای داده. فیلترهای بالای صفحه هم پیدا کردن موضوع خاص رو راحت می‌کنن.",
  },
  {
    id: "detail",
    selector: ".fb-detail-head",
    route: postRoute,
    optional: true,
    title: "هر فید‌بک، یه صفحه‌ی کامل",
    body: "با زدن روی کارت، کل ماجرا باز می‌شه: متن، رای‌ها، مسیرش تا انتشار و حرف بقیه.",
  },
  {
    id: "comments",
    selector: ".fb-comments",
    route: postRoute,
    optional: true,
    title: "گفتگو رو دنبال کن",
    body: "زیر هر فید‌بک می‌تونی کامنت بذاری، به کامنت‌ها رای بدی و پاسخ بدی. برای نوشتن فقط یه بار وارد حساب می‌شی و جواب تیم هم همین‌جا میاد.",
  },
  {
    id: "compose",
    selector: ".fb-compose-btn",
    final: true,
    noScroll: true,
    title: "حالا نوبت توئه",
    body: "هر وقت خواستی فید‌بک بدی، از همین دکمه شروع کن. برای ثبت فقط با موبایل یا ایمیل وارد می‌شی؛ بعدش چند خط می‌نویسی و بقیه‌ش با ما و رای بقیه.",
  },
];

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
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<Box | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [viewportTick, setViewportTick] = useState(0);
  const tipRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const skippedRef = useRef(new Set<string>());

  const start = useCallback(() => {
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    skippedRef.current = new Set();
    setTarget(null);
    setRect(null);
    setPlacement(null);
    setIndex(0);
    setActive(true);
  }, []);

  const close = useCallback((focusBack = true) => {
    setActive(false);
    setTarget(null);
    setRect(null);
    setPlacement(null);
    try {
      window.localStorage.setItem(SEEN_KEY, "done");
    } catch {
      // Private mode can block storage; the tour still closes.
    }
    const previous = restoreRef.current;
    if (focusBack && previous && previous.isConnected) {
      requestAnimationFrame(() => previous.focus({ preventScroll: true }));
    }
  }, []);

  const goNext = useCallback(() => {
    setIndex((value) => Math.min(value + 1, STEPS.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setIndex((value) => Math.max(value - 1, 0));
  }, []);

  useEffect(() => {
    window.addEventListener("fc:start-tour", start);
    return () => window.removeEventListener("fc:start-tour", start);
  }, [start]);

  useEffect(() => {
    if (!AUTO_ROUTES.has(pathname)) return;
    let seen = false;
    try {
      seen = Boolean(window.localStorage.getItem(SEEN_KEY));
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
        window.localStorage.setItem(SEEN_KEY, "done");
      } catch {
        // Storage is optional; the tour can still run once per load.
      }
      start();
    }, 1200);

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
    const step = STEPS[index];
    if (!step) return;

    const route = typeof step.route === "function" ? step.route() : step.route ?? null;
    if (route && route !== pathname) {
      setTarget(null);
      setRect(null);
      setPlacement(null);
      router.push(route, { scroll: false });
      return;
    }

    let frame = 0;
    let cancelled = false;
    const deadline = performance.now() + 3500;

    const find = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(step.selector);
      if (el) {
        setTarget(el);
        return;
      }
      if (performance.now() > deadline) {
        setTarget(null);
        if (step.optional && !skippedRef.current.has(step.id)) {
          skippedRef.current.add(step.id);
          setIndex((value) => Math.min(value + 1, STEPS.length - 1));
        }
        return;
      }
      frame = requestAnimationFrame(find);
    };

    find();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [active, index, pathname, router]);

  useEffect(() => {
    if (!active || !target) return;
    const step = STEPS[index];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!step?.noScroll) {
      target.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: reduce ? "auto" : "smooth",
      });
    }

    let frame = 0;
    const track = () => {
      if (!target.isConnected) {
        setTarget(null);
        return;
      }
      const box = target.getBoundingClientRect();
      const pad = 8;
      const next: Box = {
        top: Math.max(6, box.top - pad),
        left: Math.max(6, box.left - pad),
        width: Math.max(0, Math.min(window.innerWidth - 6, box.right + pad) - Math.max(6, box.left - pad)),
        height: Math.max(0, Math.min(window.innerHeight - 6, box.bottom + pad) - Math.max(6, box.top - pad)),
      };
      setRect((prev) => (prev && sameBox(prev, next) ? prev : next));
      frame = requestAnimationFrame(track);
    };

    frame = requestAnimationFrame(track);
    return () => cancelAnimationFrame(frame);
  }, [active, index, target]);

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
    if (!active) return;
    if (!rect) {
      setPlacement((prev) => (prev?.dock ? prev : { top: 0, left: 0, dock: true }));
      return;
    }
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
  }, [active, rect, index, viewportTick]);

  const finish = () => {
    close(false);
    window.dispatchEvent(new Event("fc:open-composer"));
  };

  const step = STEPS[index];
  if (!active || !step) return null;

  const total = STEPS.length;

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
            {formatNumber(index + 1)} از {formatNumber(total)}
          </span>
          <div className="fb-tour-top-actions">
            <button
              type="button"
              className="fb-tour-skip"
              onClick={() => close()}
              aria-label="رد کردن آموزش"
            >
              رد کردن
            </button>
            <button
              type="button"
              className="fb-tour-close"
              onClick={() => close()}
              aria-label="بستن آموزش"
            >
              <CloseIcon size={14} />
            </button>
          </div>
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
