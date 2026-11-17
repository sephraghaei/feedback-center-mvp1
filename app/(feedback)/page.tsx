import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthFlow from "@/app/components/auth-flow";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import ComposerButton from "@/app/components/feedback/composer-button";
import { HeroCommentScene, HeroTicker } from "@/app/components/feedback/hero-community";
import HomeStory from "@/app/components/feedback/home-story";
import PostCard from "@/app/components/feedback/post-card";
import RotatingWord from "@/app/components/feedback/rotating-word";
import TourTrigger from "@/app/components/feedback/tour-trigger";
import WipBadge from "@/app/components/feedback/wip-badge";
import { faDate, faNumber } from "@/lib/feedback/labels";
import { listChangelog } from "@/lib/feedback/changelog";
import { countFeedback, listFeed, listRoadmap } from "@/lib/feedback/posts";
import { getViewer } from "@/lib/feedback/viewer";
import { getProfile } from "@/lib/user-store";
import { OTP_LENGTH } from "@/lib/config";

export const metadata: Metadata = {
  title: "وسا",
  description: "ایده یا مشکلت رو بنویس، بقیه رای می‌دن و نتیجه رو تا انتشار توی نقشه راه و تغییرات دنبال کن.",
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

  const queued = roadmap.filter((post) => post.status === "planned").length;
  const building = roadmap.filter((post) => post.status === "in_progress").length;

  return (
    <div className="fb-home">
      <section className="fb-hero" data-cursor>
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
            وسا یه مرکز فید‌بکه. ایده یا مشکلی که داری رو بنویس، بقیه رای می‌دن و نتیجه رو تا
            انتشار دنبال کن.
          </p>
          <div className="fb-hero-actions">
            <ComposerButton className="fb-btn fb-btn-primary">فید‌بک بده</ComposerButton>
            <Link href="/feed" className="fb-btn">
              فید‌بک‌ها رو ببین
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
              <li data-accent="violet">
                <ComposerButton className="fb-path-step">
                  <span className="fb-path-num" aria-hidden="true">
                    ۱
                  </span>
                  <strong>می‌نویسی</strong>
                  <span className="fb-path-detail">چند خط کافیه</span>
                </ComposerButton>
              </li>
              <li data-accent="rose">
                <Link href="/feed" className="fb-path-step">
                  <span className="fb-path-num" aria-hidden="true">
                    ۲
                  </span>
                  <strong>فید و رأی</strong>
                  <span className="fb-path-detail">{faNumber(feedbackCount)} فید‌بک ثبت‌شده</span>
                </Link>
              </li>
              <li data-accent="amber">
                <Link href="/roadmap" className="fb-path-step">
                  <span className="fb-path-num" aria-hidden="true">
                    ۳
                  </span>
                  <span className="fb-path-title">
                    <strong>نقشه راه</strong>{" "}
                    <WipBadge />
                  </span>
                  <span className="fb-path-detail">
                    {faNumber(queued)} در صف، {faNumber(building)} در ساخت
                  </span>
                </Link>
              </li>
              <li data-accent="green">
                <Link href="/changelog" className="fb-path-step">
                  <span className="fb-path-num" aria-hidden="true">
                    ۴
                  </span>
                  <strong>انتشار</strong>
                  <span className="fb-path-detail">
                    تغییرات{" "}
                    <WipBadge />
                  </span>
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
            <p className="fb-section-sub">ایده‌های تازه رو ببین، به مهم‌ها رای بده و گفتگو رو ادامه بده.</p>
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
            <strong>هنوز فید‌بک‌ی ثبت نشده.</strong>
            اولین نفر باش و بنویس چی کمه.
            <div className="fb-empty-action">
              <ComposerButton className="fb-btn fb-btn-primary fb-btn-sm">
                اولین فید‌بک‌ت رو بنویس
              </ComposerButton>
            </div>
          </div>
        )}
      </section>

      {entries.length > 0 ? (
        <section className="fb-section" aria-labelledby="changelog-title">
          <div className="fb-section-head">
            <div>
              <h2 id="changelog-title" className="fb-section-title">آخرین تغییرات</h2>
              <p className="fb-section-sub">
                هر تغییری که منتشر می‌شه، با فید‌بک‌هایی که باعثش شدن.
              </p>
            </div>
            <Link href="/changelog" className="fb-link">
              همه تغییرات
            </Link>
          </div>

          <div className="fb-entry-list">
            {entries.map((entry) => (
              <article key={entry.id} className="fb-entry-row" data-spotlight>
                <Link href={`/changelog/${entry.id}`}>{entry.title}</Link>
                <time dateTime={entry.publishedAt.toISOString()}>{faDate(entry.publishedAt)}</time>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section id="account" className="fb-section" aria-labelledby="account-title">
        <div className="fb-section-head">
          <div>
            <h2 id="account-title" className="fb-section-title">حساب خودت</h2>
          </div>
        </div>

        {viewer ? (
          <div className="fb-account">
            <p className="fb-account-greeting">سلام، {viewer.name} عزیز</p>
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
              <>
                <p className="fb-lede">پروفایلت رو کامل کن تا فید‌بک‌هات با اسم خودت ثبت بشن.</p>
                <AuthFlow status={status} codeLength={OTP_LENGTH} nextPath={nextPath} />
              </>
            )}
            <div className="fb-account-foot">
              {viewer.method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
            </div>
          </div>
        ) : (
          <div className="fb-account">
            <p className="fb-lede">وارد شو تا درخواست‌هات رو پیگیری کنی.</p>
            <AuthFlow status={status} codeLength={OTP_LENGTH} nextPath={nextPath} />
          </div>
        )}
      </section>
    </div>
  );
}
