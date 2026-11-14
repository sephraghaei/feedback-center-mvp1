import type { Metadata } from "next";
import Link from "next/link";
import ComposerButton from "@/app/components/feedback/composer-button";
import PostCard from "@/app/components/feedback/post-card";
import { faNumber } from "@/lib/feedback/labels";
import { listMyPosts } from "@/lib/feedback/posts";
import { requireViewer } from "@/lib/feedback/viewer";

export const metadata: Metadata = {
  title: "درخواست‌های من | Feedback-center",
  description: "همه بازخوردها و درخواست‌های پشتیبانی خودت، با وضعیت به‌روز.",
};

export default async function RequestsPage() {
  const viewer = await requireViewer("/requests");
  const posts = await listMyPosts(viewer.userId);

  const publicPosts = posts.filter((post) => post.type === "feedback" && !post.hidden);
  const supportPosts = posts.filter((post) => post.type === "support");
  const hiddenPosts = posts.filter((post) => post.type === "feedback" && post.hidden);

  return (
    <>
      <section className="fb-hero">
        <p className="fb-eyebrow">
          <span className="eyebrow-mark" aria-hidden="true" />
          درخواست‌های من
        </p>
        <h1 className="fb-title">هر چه فرستادی، یک جا</h1>
        <p className="fb-lede">
          بازخوردهای عمومی و درخواست‌های پشتیبانی خصوصی‌ات را از همین‌جا دنبال کن. وضعیت هر
          درخواست را بدون ایمیل و پیام اضافه می‌بینی.
        </p>
        <div className="fb-hero-actions">
          <ComposerButton className="fb-btn fb-btn-primary">ثبت درخواست تازه</ComposerButton>
          <Link href="/feed" className="fb-btn fb-btn-ghost">
            فید بازخورد
          </Link>
        </div>
        <ul className="fb-hero-stats">
          <li>
            <strong>{faNumber(publicPosts.length)}</strong> بازخورد عمومی
          </li>
          <li>
            <strong>{faNumber(supportPosts.length)}</strong> درخواست پشتیبانی
          </li>
        </ul>
      </section>

      {posts.length === 0 ? (
        <div className="fb-empty">
          <strong>هنوز چیزی ثبت نکرده‌ای.</strong>
          اولین بازخورد یا درخواست پشتیبانی‌ات را از دکمه بالا بنویس و وضعیتش را همین‌جا ببین.
        </div>
      ) : null}

      {publicPosts.length > 0 ? (
        <section aria-labelledby="mine-feedback">
          <div className="fb-toolbar-row">
            <h2 id="mine-feedback" className="section-title" style={{ fontSize: "1.05rem" }}>
              بازخوردهای عمومی
            </h2>
            <p className="fb-count">{faNumber(publicPosts.length)} مورد</p>
          </div>
          <div className="fb-grid">
            {publicPosts.map((post) => (
              <PostCard key={post.id} post={post} signedIn nextPath="/requests" showType vote={false} />
            ))}
          </div>
        </section>
      ) : null}

      {supportPosts.length > 0 ? (
        <section aria-labelledby="mine-support" style={{ marginTop: 40 }}>
          <div className="fb-toolbar-row">
            <h2 id="mine-support" className="section-title" style={{ fontSize: "1.05rem" }}>
              درخواست‌های پشتیبانی
            </h2>
            <p className="fb-count">{faNumber(supportPosts.length)} مورد</p>
          </div>
          <p className="fb-note" style={{ marginTop: 0 }}>
            این درخواست‌ها عمومی نیستند. فقط تو و تیم پشتیبانی می‌توانید آن‌ها را ببینید.
          </p>
          <div className="fb-grid" style={{ marginTop: 16 }}>
            {supportPosts.map((post) => (
              <PostCard key={post.id} post={post} signedIn nextPath="/requests" showType vote={false} />
            ))}
          </div>
        </section>
      ) : null}

      {hiddenPosts.length > 0 ? (
        <section aria-labelledby="mine-hidden" style={{ marginTop: 40 }}>
          <div className="fb-toolbar-row">
            <h2 id="mine-hidden" className="section-title" style={{ fontSize: "1.05rem" }}>
              پنهان شده
            </h2>
            <p className="fb-count">{faNumber(hiddenPosts.length)} مورد</p>
          </div>
          <p className="field-hint">
            این موارد را مدیر از فید عمومی کنار گذاشته است. فقط خودت و مدیر می‌بینید.
          </p>
          <div className="fb-grid" style={{ marginTop: 16 }}>
            {hiddenPosts.map((post) => (
              <PostCard key={post.id} post={post} signedIn nextPath="/requests" showType vote={false} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
