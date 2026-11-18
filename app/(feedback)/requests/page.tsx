import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import PostCard from "@/app/components/feedback/post-card";
import { formatNumber } from "@/lib/feedback/labels";
import { listMyPosts } from "@/lib/feedback/posts";
import { requireViewer } from "@/lib/feedback/viewer";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = translator(await getLocale());
  return {
    title: t("درخواست‌های من | وسا", "Your posts | Vasa"),
    description: t(
      "فیدبک‌های عمومی و درخواست‌های خصوصی‌ات، با وضعیت به‌روز.",
      "Public feedback and private support requests, with live status.",
    ),
  };
}

export default async function RequestsPage() {
  const viewer = await requireViewer("/requests");
  const posts = await listMyPosts(viewer.userId);

  const locale = await getLocale();
  const t = translator(locale);
  const publicPosts = posts.filter((post) => post.type === "feedback" && !post.hidden);
  const supportPosts = posts.filter((post) => post.type === "support");
  const hiddenPosts = posts.filter((post) => post.type === "feedback" && post.hidden);
  const items = (count: number) => t(`${formatNumber(count, locale)} مورد`, `${formatNumber(count, locale)} items`);

  return (
    <>
      <section className="fb-hero fb-page-head">
        <p className="fb-eyebrow">
          <BrandMark className="eyebrow-mark" simple />
          {t("درخواست‌های من", "Your posts")}
        </p>
        <h1 className="fb-title">{t("هر چی فرستادی، یک جا", "Everything you sent, in one place")}</h1>
        <p className="fb-lede">
          {t(
            "فیدبک‌های عمومی و درخواست‌های خصوصی‌ت رو همین‌جا دنبال کن و وضعیت هر کدوم رو ببین.",
            "Follow your public feedback and private support requests, and see where each one stands right now.",
          )}
        </p>
        <div className="fb-hero-actions">
          <Link href="/" className="fb-btn fb-btn-primary">
            {t("دیدن بردها", "Browse boards")}
          </Link>
          <Link href="/profile" className="fb-btn">
            {t("پروفایل من", "My profile")}
          </Link>
        </div>
        <ul className="fb-hero-stats">
          <li>
            <strong>{formatNumber(publicPosts.length, locale)}</strong> {t("فیدبک عمومی", "public feedback")}
          </li>
          <li>
            <strong>{formatNumber(supportPosts.length, locale)}</strong> {t("درخواست پشتیبانی", "support requests")}
          </li>
        </ul>
      </section>

      {posts.length === 0 ? (
        <div className="fb-empty">
          <strong>{t("هنوز چیزی ننوشتی.", "Nothing sent yet.")}</strong>
          {t(
            "از دکمه بالا شروع کن؛ وضعیتش رو همین‌جا می‌بینی.",
            "Open a board and post your first piece of feedback. It will show up here.",
          )}
        </div>
      ) : null}

      {publicPosts.length > 0 ? (
        <section className="fb-section" aria-labelledby="mine-feedback">
          <div className="fb-section-head">
            <div>
              <h2 id="mine-feedback" className="fb-section-title">
                {t("فیدبک‌های عمومی", "Public feedback")}
              </h2>
              <p className="fb-section-sub">
                {t("هر چی نوشتی که بقیه هم می‌بینن.", "Everything you posted for others to see.")}
              </p>
            </div>
            <p className="fb-count">{items(publicPosts.length)}</p>
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
                {t("درخواست‌های پشتیبانی", "Support requests")}
              </h2>
              <p className="fb-section-sub">
                {t("خصوصیه؛ فقط خودت و تیم پشتیبانی می‌بینیدشون.", "Private: only you and the support team can see them.")}
              </p>
            </div>
            <p className="fb-count">{items(supportPosts.length)}</p>
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
                {t("پنهان شده", "Hidden")}
              </h2>
              <p className="fb-section-sub">
                {t(
                  "مدیر این‌ها رو از فید عمومی کنار گذاشته؛ فقط خودت و مدیر می‌بینیدشون.",
                  "An admin removed these from the public board. Only you and the admin can see them.",
                )}
              </p>
            </div>
            <p className="fb-count">{items(hiddenPosts.length)}</p>
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
