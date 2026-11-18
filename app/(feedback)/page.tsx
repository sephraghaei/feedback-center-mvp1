import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import AuthFlow from "@/app/components/auth-flow";
import HomeStory from "@/app/components/feedback/home-story";
import ScrollReveal from "@/app/components/feedback/scroll-reveal";
import {
  BulbIcon,
  CheckIcon,
  CommentIcon,
  CompassIcon,
  HeartIcon,
  ListIcon,
  ReplyIcon,
  SearchIcon,
  SendIcon,
  TagIcon,
  VoteUpIcon,
} from "@/app/components/feedback/icons";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import { listCompanies } from "@/lib/companies";
import { formatNumber } from "@/lib/feedback/labels";
import { getViewer } from "@/lib/feedback/viewer";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { getProfile } from "@/lib/user-store";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "fa") {
    return {
      title: "وسا | بردهای فیدبک مشتری",
      description:
        "مشتری‌ها روی برد عمومی ایده می‌نویسن، به مهم‌ها رأی می‌دن و نقشه راه رو دنبال می‌کنن. شرکت‌ها هم پنلی برای بررسی و انتشار دارن.",
    };
  }
  return {
    title: "Vasa | Customer feedback boards",
    description:
      "Customers post ideas on a public board, vote on what matters, and follow the roadmap. Companies get a workspace to triage and ship.",
  };
}

export default async function Home({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const requestedNext = params.next;
  const nextPath =
    requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : undefined;

  const viewer = await getViewer();
  if (viewer && nextPath) redirect(nextPath);

  const locale = await getLocale();
  const t = translator(locale);

  const modes = [
    {
      id: "customers",
      label: t("برای مشتری‌ها", "For customers"),
      title: t("بگو چی لازم داری، بعد ببین چطور جلو می‌ره", "Say what you need, then watch it happen"),
      points: [
        t(
          "یک برد برای هر شرکت، مرتب بر اساس رأی یا تازه‌ترین.",
          "One board per company, sorted by votes or by newest.",
        ),
        t(
          "یک باگ، ایده یا تشکر رو در کمتر از یک دقیقه بنویس.",
          "Post a bug, an idea or a compliment in under a minute.",
        ),
        t(
          "وضعیت رو از جدید تا منتشر شده دنبال کن، بدون اینکه از کسی بپرسی.",
          "Follow the status from New to Shipped without asking anyone.",
        ),
      ],
      href: "#boards",
      link: t("یک برد پیدا کن", "Find a board"),
    },
    {
      id: "companies",
      label: t("برای شرکت‌ها", "For companies"),
      title: t("پشت هر برد عمومی، یک پنل شرکت", "A workspace behind every public board"),
      points: [
        t(
          "فیدبک‌های تازه رو بررسی کن و روی نقشه راه عمومی جلو ببرشون.",
          "Triage new feedback and move it along a public roadmap.",
        ),
        t(
          "تغییرات رو منتشر کن تا فیدبک‌های وصل بهش خودکار «منتشر شده» بشن.",
          "Publish updates that mark the linked feedback as shipped.",
        ),
        t(
          "هم‌تیمی‌ها رو دعوت کن و رنگ برد رو با برندت هماهنگ کن.",
          "Invite teammates and match the board to your brand accent.",
        ),
      ],
      href: "/workspace",
      link: t("باز کردن پنل شرکت", "Open the workspace"),
    },
  ];

  const companies = await listCompanies();
  const profile = viewer ? await getProfile(viewer.userId) : null;
  const status = !viewer ? "guest" : profile ? "ready" : "needs-profile";

  const heroWords = [
    {
      before: "",
      key: t("برد فیدبک", "feedback board"),
      after: t(" مشتری‌هات", " they love"),
      color: "#1d4ed8",
    },
    {
      before: t("", "the "),
      key: t("نقشه راه", "roadmap"),
      after: t(" مشتری‌هات", " they love"),
      color: "#b45309",
    },
    {
      before: t("", "the "),
      key: t("لیست تغییرات", "changelog"),
      after: t(" مشتری‌هات", " they love"),
      color: "#6d28d9",
    },
    {
      before: t("صندوق ", "the "),
      key: t("ایده‌ها", "idea box"),
      after: t("ی مشتری‌هات", " they love"),
      color: "#be185d",
    },
    {
      before: t("", "the "),
      key: t("برد باگ‌ها", "bug board"),
      after: t(" مشتری‌هات", " they love"),
      color: "#0f766e",
    },
    {
      before: t("کانال ", "the "),
      key: t("بازخورد", "feedback hub"),
      after: t(" مشتری‌هات", " they love"),
      color: "#0369a1",
    },
  ];

  const chips = [
    { label: t("فیدبک مشتری", "Customer feedback"), icon: CommentIcon, color: "#2563eb" },
    { label: t("رأی دادن", "Upvotes"), icon: VoteUpIcon, color: "#16a34a" },
    { label: t("نقشه راه", "Roadmap"), icon: CompassIcon, color: "#d97706" },
    { label: t("وضعیت شفاف", "Status tracking"), icon: CheckIcon, color: "#7c3aed" },
    { label: t("لیست تغییرات", "Changelog"), icon: ListIcon, color: "#db2777" },
    { label: t("کامنت و پاسخ", "Comments"), icon: ReplyIcon, color: "#0d9488" },
    { label: t("جستجو در برد", "Board search"), icon: SearchIcon, color: "#0284c7" },
    { label: t("برچسب و دسته", "Tags"), icon: TagIcon, color: "#c026d3" },
    { label: t("انتشار سریع", "Fast shipping"), icon: SendIcon, color: "#ea580c" },
    { label: t("بازخورد محبوب", "Loved feedback"), icon: HeartIcon, color: "#e11d48" },
    { label: t("ایده جدید", "New ideas"), icon: BulbIcon, color: "#ca8a04" },
  ];
  const chipRows = [chips.slice(0, 6), chips.slice(6)];

  return (
    <div className="fb-home fb-landing">
      <ScrollReveal />
      <section className="landing-hero" aria-labelledby="home-title">
        <div className="landing-hero-inner">
          <span className="landing-badge">
            {t("فیدبک مشتری، از اول تا آخر", "Customer feedback, end to end")}
          </span>
          <h1 className="landing-headline" id="home-title">
            <span className="sr-only">
              {t(
                "برد فیدبک مشتری‌هات رو بساز و منتشر کن.",
                "Build the feedback board customers love, then ship it.",
              )}
            </span>
            <span className="landing-headline-visual" aria-hidden="true">
              <span className="landing-headline-line">
                <span className="landing-word-stage">
                  {heroWords.map((word, index) => (
                    <span
                      key={word.key}
                      className="landing-word"
                      style={
                        {
                          "--word-color": word.color,
                          "--word-delay": `${(index * 4.4).toFixed(1)}s`,
                        } as CSSProperties
                      }
                    >
                      {word.before}
                      <span className="landing-word-key">{word.key}</span>
                      {word.after}
                    </span>
                  ))}
                </span>
              </span>
              <span className="landing-headline-line landing-tail">
                {t("رو بساز و منتشر کن.", "Build it and ship it.")}
              </span>
            </span>
          </h1>

          <form className="landing-claim" action="/workspace" method="get">
            <span className="landing-claim-ring" aria-hidden="true" />
            <div className="landing-claim-bar">
              <span className="landing-claim-origin" dir="ltr">
                vasa.app/
              </span>
              <span className="landing-claim-field">
                <label htmlFor="board-slug" className="sr-only">
                  {t("آدرس برد", "Board address")}
                </label>
                <input
                  id="board-slug"
                  name="slug"
                  type="text"
                  dir="ltr"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={32}
                  placeholder=" "
                />
                <span className="landing-type-hint" dir="ltr" aria-hidden="true">
                  your-board
                </span>
              </span>
              <button type="submit" className="landing-claim-btn">
                {t("رایگان شروع کن!", "Start for free")}
              </button>
            </div>
            <span className="landing-claim-tip" aria-hidden="true">
              <svg viewBox="0 0 24 12" width="24" height="12" aria-hidden="true">
                <path d="M12 0 24 12H0Z" fill="currentColor" />
              </svg>
              {t("رایگان شروع کن!", "Start free")}
            </span>
          </form>

          <div className="landing-chips">
            {chipRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`landing-chip-row ${rowIndex === 1 ? "landing-chip-row-reverse" : ""}`}
              >
                <ul className="landing-chip-track">
                  {[...row, ...row].map((chip, index) => {
                    const Icon = chip.icon;
                    return (
                      <li
                        key={`${chip.label}-${index}`}
                        className="landing-chip"
                        aria-hidden={index >= row.length}
                        style={{ "--chip-color": chip.color } as CSSProperties}
                      >
                        <Icon size={17} />
                        <span>{chip.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fb-landing-body">
      <div className="fb-modes" id="how">
        {modes.map((mode, index) => (
          <article
            key={mode.id}
            className="fb-mode"
            data-reveal
            style={{ "--i": index } as CSSProperties}
          >
            <span className="fb-mode-label">
              <span className="fb-mode-num" aria-hidden="true">
                {formatNumber(index + 1, locale).padStart(2, locale === "fa" ? "۰" : "0")}
              </span>
              {mode.label}
            </span>
            <h2>{mode.title}</h2>
            <ul>
              {mode.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <Link href={mode.href} className="fb-mode-link">
              {mode.link}
              <span className="fb-mode-arrow" aria-hidden="true">
                {locale === "fa" ? "←" : "→"}
              </span>
            </Link>
          </article>
        ))}
      </div>

      <HomeStory slug={companies[0]?.slug} />

      <section className="fb-section" id="boards" aria-labelledby="boards-title">
        <div className="fb-section-head" data-reveal>
          <div>
            <h2 id="boards-title" className="fb-section-title">
              {t("بردهای عمومی", "Public boards")}
            </h2>
            <p className="fb-section-sub">
              {companies.length === 0
                ? t(
                    "بردها همین‌جا میان، به‌محض اینکه شرکتی عضو بشه.",
                    "Boards show up here as soon as a company joins.",
                  )
                : companies.length === 1
                  ? t(
                      "همین حالا یک شرکت داره فیدبک جمع می‌کنه.",
                      "One company is collecting feedback right now.",
                    )
                  : t(
                      `${formatNumber(companies.length, locale)} شرکت همین حالا فیدبک جمع می‌کنن.`,
                      `${formatNumber(companies.length, locale)} companies are collecting feedback right now.`,
                    )}
            </p>
          </div>
        </div>

        {companies.length > 0 ? (
          <div className="fb-board-links">
            {companies.map((company, index) => (
              <Link
                key={company.id}
                href={`/c/${company.slug}`}
                className="fb-board-link"
                data-reveal
                style={
                  {
                    "--board-accent": company.accent,
                    "--i": index,
                  } as CSSProperties
                }
              >
                <span className="fb-board-mark" aria-hidden="true">
                  {company.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="fb-board-text">
                  <strong>{company.name}</strong>
                  <span>{company.tagline ?? t("برد فیدبک", "Feedback board")}</span>
                </span>
                <span className="fb-board-arrow" aria-hidden="true">
                  {locale === "fa" ? "←" : "→"}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="fb-empty">
            <strong>{t("هنوز بردی نیست.", "No boards yet.")}</strong>
            {t(
              "شرکت‌ها اولین بردشون رو از پنل شرکت باز می‌کنن.",
              "Companies open their first board from the workspace.",
            )}
            <div className="fb-empty-action">
              <Link href="/workspace" className="fb-btn fb-btn-primary fb-btn-sm">
                {t("باز کردن پنل شرکت", "Open the workspace")}
              </Link>
            </div>
          </div>
        )}
      </section>

      <section id="account" className="fb-section" aria-labelledby="account-title">
        <div className="fb-section-head" data-reveal>
          <div>
            <h2 id="account-title" className="fb-section-title">
              {t("حساب خودت", "Your account")}
            </h2>
            <p className="fb-section-sub">
              {t(
                "یک حساب برای همه بردها و پنل شرکت کار می‌کنه.",
                "One account works across every board and the company workspace.",
              )}
            </p>
          </div>
        </div>

        {viewer ? (
          <div className="fb-account" data-reveal>
            <p className="fb-account-greeting">{t(`خوش برگشتی، ${viewer.name}`, `Welcome back, ${viewer.name}`)}</p>
            <div className="fb-hero-actions">
              <Link href="/requests" className="fb-btn fb-btn-primary">
                {t("نوشته‌های من", "Your posts")}
              </Link>
              <Link href="/profile" className="fb-btn">
                {t("پروفایل من", "My profile")}
              </Link>
              <Link href="/workspace" className="fb-btn fb-btn-ghost">
                {t("پنل شرکت", "Workspace")}
              </Link>
              {viewer.role === "admin" ? (
                <Link href="/admin" className="fb-btn fb-btn-ghost">
                  {t("مدیر", "Admin")}
                </Link>
              ) : null}
            </div>
            <div className="fb-account-foot">
              {viewer.method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
            </div>
          </div>
        ) : (
          <div className="fb-account" data-reveal>
            <p className="fb-lede">
              {t(
                "با ایمیل یا حساب گوگل وارد شو تا فیدبک بنویسی و رأی بدی.",
                "Log in with your email or Google account to post feedback and vote.",
              )}
            </p>
            <AuthFlow status={status} nextPath={nextPath} />
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
