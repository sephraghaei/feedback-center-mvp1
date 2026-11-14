import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthFlow from "@/app/components/auth-flow";
import BrandMark from "@/app/components/brand-mark";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import ComposerButton from "@/app/components/feedback/composer-button";
import CountUp from "@/app/components/feedback/count-up";
import { HeroCommentScene, HeroTicker } from "@/app/components/feedback/hero-community";
import PostCard from "@/app/components/feedback/post-card";
import { CATEGORY_LABELS, STATUS_LABELS, faDate, faNumber } from "@/lib/feedback/labels";
import { listChangelog } from "@/lib/feedback/changelog";
import { ROADMAP_STATUSES, countFeedback, listFeed, listRoadmap } from "@/lib/feedback/posts";
import { getViewer } from "@/lib/feedback/viewer";
import { getProfile } from "@/lib/user-store";
import { OTP_LENGTH } from "@/lib/config";

export const metadata: Metadata = {
  title: "مرکز بازخورد | Feedback-center",
  description: "بازخورد کاربران، نقشه راه و تغییرات منتشر شده در یک جا، شفاف و بدون واسطه.",
};

const COLUMN_HINTS: Record<string, string> = {
  planned: "قبول شده و تو نوبت",
  in_progress: "همین الان داریم روش کار می‌کنیم",
  shipped: "منتشر شده و در دسترس",
};

export default async function Home({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const requestedNext = params.next;
  const nextPath =
    requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : undefined;

  const viewer = await getViewer();
  if (viewer && nextPath) redirect(nextPath);

  const [recent, roadmap, entries, feedbackCount] = await Promise.all([
    listFeed({ viewerId: viewer?.userId, limit: 4 }),
    listRoadmap(viewer?.userId),
    listChangelog(4),
    countFeedback(),
  ]);
  const profile = viewer ? await getProfile(viewer.userId) : null;
  const status = !viewer ? "guest" : profile ? "ready" : "needs-profile";

  const groups = ROADMAP_STATUSES.map((status) => ({
    status,
    items: roadmap.filter((post) => post.status === status),
  }));
  const shipped = groups.find((group) => group.status === "shipped")?.items.length ?? 0;

  return (
    <div className="fb-home">
      <section className="fb-hero">
        <div className="fb-hero-aura" aria-hidden="true">
          <span className="fb-aura-glow" />
          <span className="fb-aura-grid" />
        </div>
        <span className="fb-hero-cursor" aria-hidden="true" />
        <div className="fb-hero-inner">
          <p className="fb-eyebrow fb-eyebrow-chip">
            <BrandMark className="eyebrow-mark" simple />
            <span>مرکز بازخورد</span>
            <span className="fb-live-dot" aria-hidden="true" />
          </p>
          <h1 className="fb-title">
            بازخوردت رو بنویس، <span className="fb-title-mark">مسیرش رو ببین</span>.
          </h1>
          <p className="fb-lede">
            هر نظری یا درخواستی که بنویسی، از بررسی تا نقشه راه و انتشار دنبالش می‌کنیم.
            خوندن برای همه آزاده؛ برای نوشتن و رای دادن هم کافیه وارد بشی.
          </p>
          <div className="fb-hero-actions">
            <ComposerButton className="fb-btn fb-btn-primary">بازخورد بده</ComposerButton>
            <Link href="/feed" className="fb-btn">
              بازخوردها رو ببین
            </Link>
            <Link href="/roadmap" className="fb-btn fb-btn-ghost">
              نقشه راه
            </Link>
          </div>
          <ul className="fb-hero-stats">
            <li>
              <strong>
                <CountUp value={feedbackCount} />
              </strong>
              <span>بازخورد ثبت‌شده</span>
            </li>
            <li>
              <strong>
                <CountUp value={shipped} />
              </strong>
              <span>رسیده به انتشار</span>
            </li>
            <li>
              <strong>بدون حساب</strong>
              <span>می‌تونی بازخوردها و نقشه راه رو ببینی</span>
            </li>
          </ul>
          <HeroTicker />
        </div>
        <HeroCommentScene />
      </section>

      <ol className="fb-steps-list" aria-label="مسیر یک بازخورد">
        <li className="fb-step">
          <span className="fb-step-num" aria-hidden="true">۱</span>
          <div className="fb-step-body">
            <strong>بازخورد بده</strong>
            <p>هر ایده یا دغدغه‌ای داری، تو چند خط بنویس.</p>
          </div>
        </li>
        <li className="fb-step">
          <span className="fb-step-num" aria-hidden="true">۲</span>
          <div className="fb-step-body">
            <strong>رای بگیر</strong>
            <p>بقیه رای می‌دن تا اولویت مشخص بشه.</p>
          </div>
        </li>
        <li className="fb-step">
          <span className="fb-step-num" aria-hidden="true">۳</span>
          <div className="fb-step-body">
            <strong>پیگیری کن</strong>
            <p>وضعیتش رو روی نقشه راه و تغییرات ببین.</p>
          </div>
        </li>
      </ol>

      <section className="fb-section" aria-labelledby="recent-title">
        <div className="fb-section-head">
          <div>
            <h2 id="recent-title" className="fb-section-title">تازه‌ترین بازخوردها</h2>
            <p className="fb-section-sub">ببین بقیه چی می‌گن و به چیزهایی که مهمه رای بده.</p>
          </div>
          <Link href="/feed" className="fb-link">
            همه بازخوردها
          </Link>
        </div>

        {recent.length > 0 ? (
          <div className="fb-grid">
            {recent.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                signedIn={Boolean(viewer)}
                nextPath="/feed"
              />
            ))}
          </div>
        ) : (
          <div className="fb-empty">
            <strong>هنوز هیچ بازخوردی ثبت نشده.</strong>
            اولین نفر باش و دغدغه‌ات رو بنویس.
            <div className="fb-empty-action">
              <ComposerButton className="fb-btn fb-btn-primary fb-btn-sm">
                اولین بازخوردت رو بنویس
              </ComposerButton>
            </div>
          </div>
        )}
      </section>

      <section className="fb-section" aria-labelledby="roadmap-title">
        <div className="fb-section-head">
          <div>
            <h2 id="roadmap-title" className="fb-section-title">نقشه راه، بدون ابهام</h2>
            <p className="fb-section-sub">
              هر درخواست یه ستون مشخص داره: تو نوبت، در حال انجام، یا منتشر شده.
            </p>
          </div>
          <Link href="/roadmap" className="fb-link">
            نقشه راه کامل
          </Link>
        </div>

        <div className="fb-board fb-board-preview">
          {groups.map((group) => (
            <section key={group.status} className="fb-column" aria-label={STATUS_LABELS[group.status]}>
              <div className="fb-column-head">
                <h3>{STATUS_LABELS[group.status]}</h3>
                <span>{faNumber(group.items.length)}</span>
              </div>
              <p className="field-hint fb-column-hint">{COLUMN_HINTS[group.status]}</p>
              {group.items.length > 0 ? (
                <>
                  {group.items.slice(0, 3).map((post) => (
                    <article key={post.id} className="fb-mini" data-spotlight>
                      <Link href={`/p/${post.id}`} className="fb-mini-title">
                        {post.title}
                      </Link>
                      <div className="fb-mini-meta">
                        {post.category ? (
                          <span className="fb-chip">{CATEGORY_LABELS[post.category]}</span>
                        ) : null}
                        <span>{faNumber(post.upvotes)} رای</span>
                      </div>
                    </article>
                  ))}
                  {group.items.length > 3 ? (
                    <Link href="/roadmap" className="fb-link fb-column-more">
                      {faNumber(group.items.length - 3)} مورد دیگر
                    </Link>
                  ) : null}
                </>
              ) : (
                <p className="fb-column-empty">هنوز چیزی اینجا نیست.</p>
              )}
            </section>
          ))}
        </div>
      </section>

      <section className="fb-section" aria-labelledby="changelog-title">
        <div className="fb-section-head">
          <div>
            <h2 id="changelog-title" className="fb-section-title">آخرین تغییرات</h2>
            <p className="fb-section-sub">ببین هر تغییر کدوم بازخوردها رو حل کرده.</p>
          </div>
          <Link href="/changelog" className="fb-link">
            همه تغییرات
          </Link>
        </div>

        {entries.length > 0 ? (
          <div className="fb-entry-list">
            {entries.map((entry) => (
              <article key={entry.id} className="fb-entry-row" data-spotlight>
                <Link href={`/changelog/${entry.id}`}>{entry.title}</Link>
                <time dateTime={entry.publishedAt.toISOString()}>{faDate(entry.publishedAt)}</time>
              </article>
            ))}
          </div>
        ) : (
          <div className="fb-empty">
            <strong>هنوز تغییری منتشر نشده.</strong>
            اولین نسخه که منتشر بشه، همین‌جا میاد و می‌بینی کدوم بازخوردها رو حل کرده.
          </div>
        )}
      </section>

      <section id="account" className="fb-section" aria-labelledby="account-title">
        <div className="fb-section-head">
          <div>
            <h2 id="account-title" className="fb-section-title">حساب خودت</h2>
            <p className="fb-section-sub">با پیامک یا ایمیل وارد شو؛ رمز عبور نمی‌خواد.</p>
          </div>
        </div>

        {viewer ? (
          <div className="fb-account">
            <p className="fb-eyebrow">
              <BrandMark className="eyebrow-mark" simple />
              خوش آمدی
            </p>
            <p className="fb-account-greeting">سلام، {viewer.name} عزیز</p>
            <p className="fb-lede">
              {profile
                ? "همه بازخوردها و درخواست‌هات یه جا جمعن؛ وضعیت هر کدوم رو همین‌جا ببین."
                : "پروفایلت رو کامل کن تا بازخوردها با اسم خودت ثبت بشن."}
            </p>
            {profile ? (
              <div className="fb-hero-actions">
                <Link href="/requests" className="fb-btn fb-btn-primary">
                  درخواست‌هام
                </Link>
                <Link href="/feed" className="fb-btn">
                  بازخوردها
                </Link>
                {viewer.role === "admin" ? (
                  <Link href="/admin" className="fb-btn fb-btn-ghost">
                    پنل مدیر
                  </Link>
                ) : null}
              </div>
            ) : (
              <AuthFlow status={status} codeLength={OTP_LENGTH} nextPath={nextPath} />
            )}
            <div className="fb-account-foot">
              {viewer.method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
            </div>
          </div>
        ) : (
          <div className="fb-account">
            <p className="fb-account-greeting">بازخوردت رو پیگیری کن</p>
            <p className="fb-lede">
              با شماره موبایل یا ایمیل وارد شو. بعدش درخواست‌هات رو می‌بینی و وضعیتشون رو
              دنبال می‌کنی.
            </p>
            <AuthFlow status={status} codeLength={OTP_LENGTH} nextPath={nextPath} />
          </div>
        )}
      </section>
    </div>
  );
}
