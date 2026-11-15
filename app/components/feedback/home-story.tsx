"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { faNumber } from "@/lib/feedback/labels";
import ComposerButton from "./composer-button";

function SceneStart() {
  return (
    <svg className="fb-comic-art" viewBox="0 0 400 300" fill="none" aria-hidden="true">
      <rect
        x="58"
        y="76"
        width="240"
        height="172"
        rx="14"
        fill="var(--surface-3)"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
      />
      <path d="M58 106h240" stroke="var(--hairline-strong)" strokeWidth="1.5" />
      <circle cx="76" cy="91" r="3" fill="var(--ink-4)" />
      <circle cx="88" cy="91" r="3" fill="var(--ink-4)" />
      <circle cx="100" cy="91" r="3" fill="var(--ink-4)" />
      <rect x="78" y="122" width="104" height="9" rx="4.5" fill="var(--ink-4)" />
      <rect x="78" y="142" width="172" height="7" rx="3.5" fill="var(--hairline-strong)" />
      <rect x="78" y="157" width="132" height="7" rx="3.5" fill="var(--hairline)" />
      <rect
        x="78"
        y="184"
        width="86"
        height="26"
        rx="13"
        stroke="var(--ink-4)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <path d="M111 197h20M121 187v20" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M178 196v30l8-8 6 12 7-3.5-6-12 11-1z" fill="var(--ink)" />
      <circle cx="316" cy="102" r="26" fill="var(--accent)" />
      <text
        x="316"
        y="111"
        textAnchor="middle"
        fontSize="24"
        fontWeight="700"
        fill="var(--on-accent)"
      >
        ؟
      </text>
      <path
        d="M290 118l-14 10M296 128l-8 12"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 4"
      />
      <path d="M300 200l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="var(--ink-5)" />
    </svg>
  );
}

function SceneWrite() {
  return (
    <svg className="fb-comic-art" viewBox="0 0 400 300" fill="none" aria-hidden="true">
      <rect
        x="54"
        y="64"
        width="214"
        height="190"
        rx="14"
        fill="var(--surface-3)"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
      />
      <rect x="74" y="88" width="64" height="7" rx="3.5" fill="var(--ink-4)" />
      <rect
        x="74"
        y="106"
        width="174"
        height="30"
        rx="8"
        fill="var(--surface)"
        stroke="var(--hairline-strong)"
      />
      <rect x="86" y="117" width="72" height="7" rx="3.5" fill="var(--hairline-strong)" />
      <rect
        x="74"
        y="148"
        width="174"
        height="52"
        rx="8"
        fill="var(--surface)"
        stroke="var(--hairline-strong)"
      />
      <rect x="86" y="160" width="130" height="7" rx="3.5" fill="var(--hairline-strong)" />
      <rect x="86" y="175" width="96" height="7" rx="3.5" fill="var(--hairline)" />
      <rect x="74" y="214" width="88" height="26" rx="13" fill="var(--accent)" />
      <rect x="90" y="225" width="30" height="4" rx="2" fill="var(--on-accent)" />
      <circle
        cx="184"
        cy="227"
        r="11"
        stroke="var(--ink-4)"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <path d="M184 222v10M179 227h10" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M312 88l48 24-48 24 13-24z"
        fill="var(--accent)"
        stroke="var(--ink)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M325 112h35" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M288 78c-12 14-18 30-16 48"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <path d="M274 198l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="var(--ink-5)" />
    </svg>
  );
}

function SceneVote() {
  return (
    <svg className="fb-comic-art" viewBox="0 0 400 300" fill="none" aria-hidden="true">
      <rect
        x="54"
        y="62"
        width="214"
        height="186"
        rx="14"
        fill="var(--surface-3)"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
      />
      <rect x="74" y="82" width="120" height="9" rx="4.5" fill="var(--ink-4)" />
      <rect x="74" y="102" width="160" height="7" rx="3.5" fill="var(--hairline-strong)" />
      <rect x="74" y="117" width="130" height="7" rx="3.5" fill="var(--hairline)" />
      <rect x="74" y="146" width="86" height="34" rx="17" fill="var(--accent)" />
      <path
        d="M96 172v-14M89 165l7-7 7 7"
        stroke="var(--on-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="120" y="171" fontSize="15" fontWeight="700" fill="var(--on-accent)">
        ۲۴
      </text>
      <circle cx="84" cy="214" r="13" fill="var(--surface)" stroke="var(--hairline-strong)" />
      <circle cx="108" cy="214" r="13" fill="var(--surface)" stroke="var(--hairline-strong)" />
      <circle cx="132" cy="214" r="13" fill="var(--surface)" stroke="var(--hairline-strong)" />
      <path
        d="M250 78h96a12 12 0 0 1 12 12v42a12 12 0 0 1-12 12h-42l-14 16v-16h-40a12 12 0 0 1-12-12V90a12 12 0 0 1 12-12z"
        fill="var(--surface)"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
      />
      <text x="304" y="121" textAnchor="middle" fontSize="19" fontWeight="700" fill="var(--ink)">
        +۲
      </text>
      <path
        d="M298 202v-16M289 193l9-9 9 9"
        stroke="var(--ink-4)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M340 216v-26M329 201l11-11 11 11"
        stroke="var(--ink-5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SceneRoadmap() {
  return (
    <svg className="fb-comic-art" viewBox="0 0 400 300" fill="none" aria-hidden="true">
      <rect
        x="44"
        y="72"
        width="312"
        height="164"
        rx="14"
        fill="var(--surface-3)"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
      />
      <path d="M148 72v164M252 72v164" stroke="var(--hairline)" strokeWidth="1.5" />
      <rect x="58" y="86" width="52" height="7" rx="3.5" fill="var(--ink-4)" />
      <rect x="162" y="86" width="52" height="7" rx="3.5" fill="var(--ink-4)" />
      <rect x="266" y="86" width="52" height="7" rx="3.5" fill="var(--ink-4)" />
      <rect x="58" y="104" width="76" height="34" rx="8" fill="var(--surface)" stroke="var(--hairline-strong)" />
      <rect x="66" y="114" width="40" height="5" rx="2.5" fill="var(--hairline-strong)" />
      <rect x="66" y="124" width="26" height="5" rx="2.5" fill="var(--hairline)" />
      <rect x="58" y="146" width="76" height="34" rx="8" fill="var(--surface)" stroke="var(--hairline-strong)" />
      <rect x="66" y="156" width="44" height="5" rx="2.5" fill="var(--hairline-strong)" />
      <rect x="66" y="166" width="24" height="5" rx="2.5" fill="var(--hairline)" />
      <rect
        x="162"
        y="104"
        width="76"
        height="48"
        rx="8"
        fill="var(--surface)"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />
      <rect x="170" y="114" width="48" height="5" rx="2.5" fill="var(--ink-3)" />
      <rect x="170" y="124" width="32" height="5" rx="2.5" fill="var(--hairline-strong)" />
      <rect x="170" y="136" width="60" height="6" rx="3" fill="var(--hairline)" />
      <rect x="170" y="136" width="40" height="6" rx="3" fill="var(--accent)" />
      <rect x="162" y="160" width="76" height="34" rx="8" fill="var(--surface)" stroke="var(--hairline-strong)" />
      <rect x="170" y="170" width="38" height="5" rx="2.5" fill="var(--hairline-strong)" />
      <rect x="170" y="180" width="22" height="5" rx="2.5" fill="var(--hairline)" />
      <rect x="266" y="104" width="76" height="34" rx="8" fill="var(--surface)" stroke="var(--hairline-strong)" />
      <circle cx="280" cy="121" r="7" fill="var(--green)" />
      <path
        d="M277 121l2 2 4-4"
        stroke="var(--surface)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="292" y="118" width="40" height="6" rx="3" fill="var(--hairline-strong)" />
      <path
        d="M312 204v-22M303 191l9-9 9 9"
        stroke="var(--ink-4)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M96 220h44M140 214l8 6-8 6"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M352 62l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="var(--ink-5)" />
    </svg>
  );
}

function SceneShip() {
  return (
    <svg className="fb-comic-art" viewBox="0 0 400 300" fill="none" aria-hidden="true">
      <rect
        x="58"
        y="62"
        width="284"
        height="188"
        rx="14"
        fill="var(--surface-3)"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
      />
      <rect x="78" y="82" width="70" height="20" rx="10" fill="var(--accent)" />
      <text x="113" y="96" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--on-accent)">
        ۲٫۰
      </text>
      <rect x="290" y="87" width="34" height="10" rx="5" fill="var(--hairline)" />
      <rect x="78" y="120" width="150" height="11" rx="5.5" fill="var(--ink-4)" />
      <rect x="78" y="141" width="220" height="7" rx="3.5" fill="var(--hairline-strong)" />
      <rect x="78" y="156" width="184" height="7" rx="3.5" fill="var(--hairline)" />
      <circle cx="86" cy="190" r="7" fill="var(--green)" />
      <path
        d="M83 190l2 2 4-4"
        stroke="var(--surface)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="100" y="186" width="118" height="7" rx="3.5" fill="var(--hairline-strong)" />
      <circle cx="86" cy="220" r="7" fill="var(--green)" />
      <path
        d="M83 220l2 2 4-4"
        stroke="var(--surface)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="100" y="216" width="94" height="7" rx="3.5" fill="var(--hairline-strong)" />
      <path d="M284 184v48" stroke="var(--hairline-strong)" strokeWidth="1.5" />
      <circle cx="284" cy="190" r="4" fill="var(--accent)" />
      <circle cx="284" cy="224" r="4" fill="var(--hairline-strong)" />
      <path d="M336 46l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="var(--ink-5)" />
      <path d="M56 44l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="var(--ink-5)" />
    </svg>
  );
}

const CHAPTERS = [
  {
    kicker: "پرده اول",
    title: "یه چیزی کمه",
    body: "یکی وسط کار به مشکل می‌خوره یا یه ایده به ذهنش می‌رسه. همین جمله کافیه تا ماجرا شروع بشه.",
    bubble: "اینجا یه چیزی کمه",
    cta: { kind: "composer" as const, label: "همین حالا بنویس" },
    scene: SceneStart,
  },
  {
    kicker: "پرده دوم",
    title: "بنویسش، با جزئیات",
    body: "چند خط توضیح کافیه: چی شده، کجا، و چه انتظاری داری. عکس هم می‌تونی بچسبونی تا موضوع روشن‌تر بشه.",
    bubble: "بنویسش",
    cta: { kind: "link" as const, href: "/feed", label: "بقیه چطور نوشتن" },
    scene: SceneWrite,
  },
  {
    kicker: "پرده سوم",
    title: "بقیه هم همراهش می‌شن",
    body: "کاربرهای دیگه فید‌بک رو می‌خونن، رای می‌دن و کامنت می‌ذارن. هرچی رای بیشتر، شانس دیده شدن هم بیشتر.",
    bubble: "۲۴ رای",
    cta: { kind: "link" as const, href: "/feed", label: "فید‌بک‌ها و رای‌ها" },
    scene: SceneVote,
  },
  {
    kicker: "پرده چهارم",
    title: "روی نقشه راه جلو می‌ره",
    body: "فید‌بک‌هایی که رای بیشتری دارن روی نقشه راه بالا می‌رن: از انتظار به در حال ساخت و بعد منتشر. هر وقت بخوای می‌بینی نوبت کدومه.",
    bubble: "در حال ساخت",
    cta: { kind: "link" as const, href: "/roadmap", label: "نقشه راه" },
    scene: SceneRoadmap,
  },
  {
    kicker: "پرده پنجم",
    title: "ساخته می‌شه و منتشر",
    body: "وقتی ساخته و منتشر شد، توی تغییرات با جزئیات می‌بینی چی عوض شده. بعد دوباره می‌تونی فید‌بک بدی و چرخه ادامه پیدا کنه.",
    bubble: "منتشر شد",
    cta: { kind: "link" as const, href: "/changelog", label: "تغییرات منتشرشده" },
    scene: SceneShip,
  },
];

export default function HomeStory() {
  const [active, setActive] = useState(0);
  const chapterRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const nodes = chapterRefs.current.filter((node): node is HTMLLIElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.chapter);
          if (!Number.isNaN(index)) setActive(index);
        }
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function goTo(index: number) {
    const node = chapterRefs.current[index];
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }

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
        <div className="fb-story-figure">
          <div className="fb-comic">
            <span className="fb-comic-count" aria-hidden="true">
              {faNumber(active + 1)} / {faNumber(CHAPTERS.length)}
            </span>
            {CHAPTERS.map((chapter, index) => {
              const Scene = chapter.scene;
              return (
                <div
                  key={chapter.title}
                  className={`fb-comic-panel ${index === active ? "active" : ""}`}
                  data-scene={index + 1}
                  aria-hidden="true"
                >
                  <Scene />
                  <span className="fb-comic-bubble">{chapter.bubble}</span>
                </div>
              );
            })}
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
            <span className="fb-story-meter-label">{CHAPTERS[active].kicker}</span>
          </div>
        </div>

        <ol className="fb-story-track">
          {CHAPTERS.map((chapter, index) => {
            const Scene = chapter.scene;
            return (
              <li
                key={chapter.title}
                ref={(node) => {
                  chapterRefs.current[index] = node;
                }}
                data-chapter={index}
                className={`fb-story-chapter ${index === active ? "active" : ""}`}
              >
                <span className="fb-story-step">{chapter.kicker}</span>
                <h3 className="fb-story-chapter-title">{chapter.title}</h3>
                <p className="fb-story-chapter-body">{chapter.body}</p>

                <div className="fb-comic fb-comic-inline" aria-hidden="true">
                  <div className="fb-comic-panel active" data-scene={index + 1}>
                    <Scene />
                    <span className="fb-comic-bubble">{chapter.bubble}</span>
                  </div>
                </div>

                {chapter.cta.kind === "composer" ? (
                  <ComposerButton className="fb-story-link">{chapter.cta.label}</ComposerButton>
                ) : (
                  <Link href={chapter.cta.href} className="fb-story-link">
                    {chapter.cta.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
