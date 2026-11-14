import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthFlow from "@/app/components/auth-flow";
import BrandMark from "@/app/components/brand-mark";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import ComposerButton from "@/app/components/feedback/composer-button";
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
  planned: "پذیرفته شده و در نوبت",
  in_progress: "همین حالا روی آن کار می‌کنیم",
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
        <div className="fb-hero-inner">
          <p className="fb-eyebrow fb-eyebrow-chip">
            <BrandMark className="eyebrow-mark" simple />
            <span>مرکز بازخورد</span>
            <span className="fb-live-dot" aria-hidden="true" />
          </p>
          <h1 className="fb-title">
            بازخورد کاربران را <span className="fb-title-mark">ساده بشنو</span>.
          </h1>
          <p className="fb-lede">
            هر نظر و درخواست یک مسیر روشن دارد: از فید بازخوردها تا نقشه راه و تغییرات منتشر
            شده. خواندن برای همه آزاد است؛ نوشتن و رای دادن فقط یک حساب می‌خواهد.
          </p>
          <div className="fb-hero-actions">
            <ComposerButton className="fb-btn fb-btn-primary">ثبت بازخورد</ComposerButton>
            <Link href="/feed" className="fb-btn">
              فید بازخوردها
            </Link>
            <Link href="/roadmap" className="fb-btn fb-btn-ghost">
              نقشه راه
            </Link>
          </div>
          <ul className="fb-hero-stats">
            <li>
              <strong>{faNumber(feedbackCount)}</strong>
              <span>بازخورد ثبت شده</span>
            </li>
            <li>
              <strong>{faNumber(shipped)}</strong>
              <span>رسیده به انتشار</span>
            </li>
            <li>
              <strong>بدون حساب</strong>
              <span>خواندن فید و نقشه راه</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="fb-section" aria-labelledby="recent-title">
        <div className="fb-section-head">
          <div>
            <h2 id="recent-title" className="fb-section-title">تازه‌ترین بازخوردها</h2>
            <p className="fb-section-sub">آخرین چیزهایی که کاربران نوشته‌اند، همراه با رای‌ها.</p>
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
            <strong>هنوز بازخوردی ثبت نشده.</strong>
            اولین نفر باش و چیزی که در ذهن داری را بنویس.
          </div>
        )}
      </section>

      <section className="fb-section" aria-labelledby="roadmap-title">
        <div className="fb-section-head">
          <div>
            <h2 id="roadmap-title" className="fb-section-title">نقشه راه، همین حالا</h2>
            <p className="fb-section-sub">هر بازخورد دقیقا در یک ستون است، بدون ابهام.</p>
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
                    <article key={post.id} className="fb-mini">
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
            <p className="fb-section-sub">هر ورودی به بازخوردهایی وصل است که آن را حل کرده‌اند.</p>
          </div>
          <Link href="/changelog" className="fb-link">
            همه تغییرات
          </Link>
        </div>

        {entries.length > 0 ? (
          <div className="fb-entry-list">
            {entries.map((entry) => (
              <article key={entry.id} className="fb-entry-row">
                <Link href={`/changelog/${entry.id}`}>{entry.title}</Link>
                <time dateTime={entry.publishedAt.toISOString()}>{faDate(entry.publishedAt)}</time>
              </article>
            ))}
          </div>
        ) : (
          <div className="fb-empty">
            <strong>هنوز تغییری منتشر نشده.</strong>
            وقتی اولین تغییر منتشر شود، همین‌جا با پیوند به بازخوردهایش می‌آید.
          </div>
        )}
      </section>

      <section id="account" className="fb-section" aria-labelledby="account-title">
        <div className="fb-section-head">
          <div>
            <h2 id="account-title" className="fb-section-title">حساب کاربری</h2>
            <p className="fb-section-sub">بدون رمز عبور، با پیامک یا ایمیل.</p>
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
                ? "بازخوردهایت و درخواست‌های پشتیبانی‌ات یک جا هستند و وضعیتشان را همین‌جا می‌بینی."
                : "پروفایلت را کامل کن تا بازخوردهایت با نام و مشخصات درست نمایش داده شوند."}
            </p>
            {profile ? (
              <div className="fb-hero-actions">
                <Link href="/requests" className="fb-btn fb-btn-primary">
                  درخواست‌های من
                </Link>
                <Link href="/feed" className="fb-btn">
                  فید بازخوردها
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
            <p className="fb-account-greeting">به حساب خودت برگرد</p>
            <p className="fb-lede">
              شماره موبایلت را وارد کن تا کد ورود پیامک شود، یا با ایمیل و حساب گوگل وارد شو.
              بعد از ورود، پروفایلت را در چند ثانیه کامل می‌کنی.
            </p>
            <AuthFlow status={status} codeLength={OTP_LENGTH} nextPath={nextPath} />
          </div>
        )}
      </section>
    </div>
  );
}
