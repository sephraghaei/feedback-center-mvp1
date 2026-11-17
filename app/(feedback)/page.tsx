import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthFlow from "@/app/components/auth-flow";
import BrandMark from "@/app/components/brand-mark";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import ComposerButton from "@/app/components/feedback/composer-button";
import CountUp from "@/app/components/feedback/count-up";
import { HeroCommentScene, HeroTicker } from "@/app/components/feedback/hero-community";
import HomeStory from "@/app/components/feedback/home-story";
import PostCard from "@/app/components/feedback/post-card";
import RotatingWord from "@/app/components/feedback/rotating-word";
import TourTrigger from "@/app/components/feedback/tour-trigger";
import { STATUS_LABELS, faDate, faNumber } from "@/lib/feedback/labels";
import { listChangelog } from "@/lib/feedback/changelog";
import { ROADMAP_STATUSES, countFeedback, listFeed, listRoadmap } from "@/lib/feedback/posts";
import { getViewer } from "@/lib/feedback/viewer";
import { getProfile } from "@/lib/user-store";
import { OTP_LENGTH } from "@/lib/config";

export const metadata: Metadata = {
  title: "وسا",
  description: "فید‌بک کاربران و تغییرات منتشر شده در یک جا، شفاف و بدون واسطه. نقشه راه هم به زودی اضافه می‌شود.",
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
  const queued = groups.find((group) => group.status === "planned")?.items.length ?? 0;
  const building = groups.find((group) => group.status === "in_progress")?.items.length ?? 0;

  return (
    <div className="fb-home">
      <section className="fb-hero">
        <div className="fb-hero-aura" aria-hidden="true">
          <span className="fb-aura-glow" />
          <span className="fb-aura-grid" />
        </div>
        <div className="fb-hero-inner">
          <h1 className="fb-title">
            <span className="sr-only">به هر وب‌سایت، اپلیکیشن، فروشگاه یا محصولی فیدبک بده.</span>
            <span className="fb-title-line" aria-hidden="true">
              <span className="fb-title-pre">به هر</span> <RotatingWord />
            </span>
            <span className="fb-title-line" aria-hidden="true">
              فیدبک بده.
            </span>
          </h1>
          <p className="fb-lede">
            هر نظری یا درخواستی که بنویسی، از بررسی تا انتشار دنبالش می‌کنیم. خواندن برای همه آزاده؛
            برای نوشتن و رای دادن هم کافیه وارد بشی.
          </p>
          <div className="fb-hero-actions">
            <div className="fb-hero-cta">
              <span className="fb-hero-spark">کمتر از یک دقیقه</span>
              <ComposerButton className="fb-btn fb-btn-primary">فید‌بک بده</ComposerButton>
            </div>
            <Link href="/feed" className="fb-btn">
              فید‌بک‌ها رو ببین
            </Link>
            <Link href="/roadmap" className="fb-btn fb-btn-ghost">
              نقشه راه{" "}
              <span className="fb-soon">به زودی</span>
            </Link>
          </div>
          <div
            className="fb-hero-path"
            role="group"
            aria-label="مسیر یک فید‌بک از نوشتن تا انتشار"
          >
            <div className="fb-hero-path-head">
              <span className="fb-hero-path-label">مسیر یک فید‌بک</span>
              <TourTrigger />
            </div>
            <ol className="fb-hero-path-steps">
              <li>
                <ComposerButton className="fb-path-step">
                  <span className="fb-path-num" aria-hidden="true">
                    ۱
                  </span>
                  <strong>می‌نویسی</strong>
                  <span className="fb-path-detail">چند خط کافیه</span>
                </ComposerButton>
              </li>
              <li>
                <Link href="/feed" className="fb-path-step">
                  <span className="fb-path-num" aria-hidden="true">
                    ۲
                  </span>
                  <strong>فید و رأی</strong>
                  <span className="fb-path-detail">{faNumber(feedbackCount)} فید‌بک ثبت‌شده</span>
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="fb-path-step">
                  <span className="fb-path-num" aria-hidden="true">
                    ۳
                  </span>
                  <strong>نقشه راه</strong>
                  <span className="fb-path-detail">
                    {faNumber(queued)} در صف، {faNumber(building)} در ساخت
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="fb-path-step">
                  <span className="fb-path-num" aria-hidden="true">
                    ۴
                  </span>
                  <strong>انتشار</strong>
                  <span className="fb-path-detail">تغییرات رو ببین</span>
                </Link>
              </li>
            </ol>
          </div>
          <HeroTicker />
        </div>
        <HeroCommentScene />
      </section>

      <HomeStory />

      <section className="fb-section" aria-labelledby="recent-title">
        <div className="fb-section-head">
          <div>
            <h2 id="recent-title" className="fb-section-title">تازه‌ترین فید‌بک‌ها</h2>
            <p className="fb-section-sub">ببین بقیه چی می‌گن و به چیزهایی که مهمه رای بده.</p>
          </div>
          <Link href="/feed" className="fb-link">
            همه فید‌بک‌ها
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
            <strong>هنوز هیچ فید‌بک‌ی ثبت نشده.</strong>
            اولین نفر باش و دغدغه‌ات رو بنویس.
            <div className="fb-empty-action">
              <ComposerButton className="fb-btn fb-btn-primary fb-btn-sm">
                اولین فید‌بک‌ت رو بنویس
              </ComposerButton>
            </div>
          </div>
        )}
      </section>

      <section className="fb-section" aria-labelledby="roadmap-title">
        <div className="fb-section-head">
          <div>
            <h2 id="roadmap-title" className="fb-section-title">
              نقشه راه{" "}
              <span className="fb-soon">به زودی</span>
            </h2>
            <p className="fb-section-sub">
              نقشه راه در دست توسعه‌ست. پایین‌تر یه پیش‌نمایشه؛ وضعیت هر فید‌بک رو فعلا روی کارتش و
              تو فید دنبال کن.
            </p>
          </div>
          <Link href="/roadmap" className="fb-link">
            پیش‌نمایش نقشه راه
          </Link>
        </div>

        <div className="fb-board fb-board-preview">
          {groups.map((group) => (
            <section key={group.status} className="fb-column" aria-label={STATUS_LABELS[group.status]}>
              <div className="fb-column-head">
                <h3>
                  {STATUS_LABELS[group.status]}
                  {group.status === "in_progress" ? (
                    <span className="fb-column-live" aria-hidden="true" />
                  ) : null}
                </h3>
                <span className="fb-column-count">
                  <CountUp value={group.items.length} />
                </span>
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
            <p className="fb-section-sub">ببین هر تغییر کدوم فید‌بک‌ها رو حل کرده.</p>
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
            اولین نسخه که منتشر بشه، همین‌جا میاد و می‌بینی کدوم فید‌بک‌ها رو حل کرده.
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
                ? "همه فید‌بک‌ها و درخواست‌هات یه جا جمعن؛ وضعیت هر کدوم رو همین‌جا ببین."
                : "پروفایلت رو کامل کن تا فید‌بک‌ها با اسم خودت ثبت بشن."}
            </p>
            {profile ? (
              <div className="fb-hero-actions">
                <Link href="/requests" className="fb-btn fb-btn-primary">
                  درخواست‌هام
                </Link>
                <Link href="/profile" className="fb-btn">
                  پروفایل من
                </Link>
                <Link href="/feed" className="fb-btn fb-btn-ghost">
                  فید‌بک‌ها
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
            <p className="fb-account-greeting">فید‌بک‌ت رو پیگیری کن</p>
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
