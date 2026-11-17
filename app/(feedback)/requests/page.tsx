import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import ComposerButton from "@/app/components/feedback/composer-button";
import PostCard from "@/app/components/feedback/post-card";
import { faNumber } from "@/lib/feedback/labels";
import { listMyPosts } from "@/lib/feedback/posts";
import { requireViewer } from "@/lib/feedback/viewer";

export const metadata: Metadata = {
  title: "درخواست‌های من | وسا",
  description: "فید‌بک‌های عمومی و درخواست‌های خصوصی‌ات، با وضعیت به‌روز.",
};

export default async function RequestsPage() {
  const viewer = await requireViewer("/requests");
  const posts = await listMyPosts(viewer.userId);

  const publicPosts = posts.filter((post) => post.type === "feedback" && !post.hidden);
  const supportPosts = posts.filter((post) => post.type === "support");
  const hiddenPosts = posts.filter((post) => post.type === "feedback" && post.hidden);

  return (
    <>
      <section className="fb-hero fb-page-head">
        <p className="fb-eyebrow">
          <BrandMark className="eyebrow-mark" simple />
          درخواست‌های من
        </p>
        <h1 className="fb-title">هر چی فرستادی، یک جا</h1>
        <p className="fb-lede">
          فید‌بک‌های عمومی و درخواست‌های خصوصی‌ت رو همین‌جا دنبال کن و وضعیت هر کدوم رو ببین.
        </p>
        <div className="fb-hero-actions">
          <ComposerButton className="fb-btn fb-btn-primary">فید‌بک بده</ComposerButton>
          <Link href="/profile" className="fb-btn">
            پروفایل من
          </Link>
        </div>
        <ul className="fb-hero-stats">
          <li>
            <strong>{faNumber(publicPosts.length)}</strong> فید‌بک عمومی
          </li>
          <li>
            <strong>{faNumber(supportPosts.length)}</strong> درخواست پشتیبانی
          </li>
        </ul>
      </section>

      {posts.length === 0 ? (
        <div className="fb-empty">
          <strong>هنوز چیزی ننوشتی.</strong>
          از دکمه بالا شروع کن؛ وضعیتش رو همین‌جا می‌بینی.
        </div>
      ) : null}

      {publicPosts.length > 0 ? (
        <section className="fb-section" aria-labelledby="mine-feedback">
          <div className="fb-section-head">
            <div>
              <h2 id="mine-feedback" className="fb-section-title">
                فید‌بک‌های عمومی
              </h2>
              <p className="fb-section-sub">هر چی نوشتی که بقیه هم می‌بینن.</p>
            </div>
            <p className="fb-count">{faNumber(publicPosts.length)} مورد</p>
          </div>
          <div className="fb-grid">
            {publicPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                signedIn
                nextPath="/requests"
                showType
                vote={false}
                ownerActions
              />
            ))}
          </div>
        </section>
      ) : null}

      {supportPosts.length > 0 ? (
        <section className="fb-section" aria-labelledby="mine-support">
          <div className="fb-section-head">
            <div>
              <h2 id="mine-support" className="fb-section-title">
                درخواست‌های پشتیبانی
              </h2>
              <p className="fb-section-sub">خصوصیه؛ فقط خودت و تیم پشتیبانی می‌بینیدشون.</p>
            </div>
            <p className="fb-count">{faNumber(supportPosts.length)} مورد</p>
          </div>
          <div className="fb-grid">
            {supportPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                signedIn
                nextPath="/requests"
                showType
                vote={false}
                ownerActions
              />
            ))}
          </div>
        </section>
      ) : null}

      {hiddenPosts.length > 0 ? (
        <section className="fb-section" aria-labelledby="mine-hidden">
          <div className="fb-section-head">
            <div>
              <h2 id="mine-hidden" className="fb-section-title">
                پنهان شده
              </h2>
              <p className="fb-section-sub">
                مدیر این‌ها رو از فید عمومی کنار گذاشته؛ فقط خودت و مدیر می‌بینیدشون.
              </p>
            </div>
            <p className="fb-count">{faNumber(hiddenPosts.length)} مورد</p>
          </div>
          <div className="fb-grid">
            {hiddenPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                signedIn
                nextPath="/requests"
                showType
                vote={false}
                ownerActions
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
