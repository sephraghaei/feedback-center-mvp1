import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import ComposerButton from "@/app/components/feedback/composer-button";
import CountUp from "@/app/components/feedback/count-up";
import PostCard from "@/app/components/feedback/post-card";
import { CATEGORY_LABELS, STATUS_LABELS, faNumber } from "@/lib/feedback/labels";
import { FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, listFeed } from "@/lib/feedback/posts";
import { getViewer } from "@/lib/feedback/viewer";

export const metadata: Metadata = {
  title: "فید‌بک‌ها | وسا",
  description: "فید‌بک محصول را بخوان، رای بده و وضعیتش را دنبال کن. نقشه راه هم به زودی می‌آید.",
};

type Search = { category?: string; status?: string };

function filterHref(current: Search, patch: Search): string {
  const next = { ...current, ...patch };
  const query = new URLSearchParams();
  if (next.category) query.set("category", next.category);
  if (next.status) query.set("status", next.status);
  const text = query.toString();
  return text ? `/feed?${text}` : "/feed";
}

export default async function FeedPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const viewer = await getViewer();
  const posts = await listFeed({
    category: params.category,
    status: params.status,
    viewerId: viewer?.userId,
  });

  const current: Search = { category: params.category, status: params.status };
  const filtered = Boolean(params.category || params.status);

  return (
    <>
      <section className="fb-hero">
        <p className="fb-eyebrow">
          <BrandMark className="eyebrow-mark" simple />
          جریان فید‌بک
        </p>
        <h1 className="fb-title">آنچه کاربران می‌خواهند، شفاف و مرتب</h1>
        <p className="fb-lede">
          فید‌بک‌ها را بخوان، به آن‌ها رای بده و وضعیت هر کدام را ببین. نقشه راه هم به زودی کامل
          می‌شه. خواندن برای همه آزاد است؛ نوشتن فقط یک حساب می‌خواهد.
        </p>
        <div className="fb-hero-actions">
          <ComposerButton className="fb-btn fb-btn-primary">ثبت فید‌بک تازه</ComposerButton>
          <Link href="/roadmap" className="fb-btn">
            نقشه راه{" "}
            <span className="fb-soon">به زودی</span>
          </Link>
          <Link href="/changelog" className="fb-btn fb-btn-ghost">
            تغییرات منتشر شده
          </Link>
        </div>
        <ul className="fb-hero-stats">
          <li>
            <strong>
              <CountUp value={posts.length} />
            </strong>{" "}
            فید‌بک در این نما
          </li>
          <li>بدون نیاز به حساب</li>
        </ul>
      </section>

      <div className="fb-toolbar-row">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <div className="fb-filters" aria-label="فیلتر دسته">
            <Link href={filterHref(current, { category: undefined })} className={`fb-filter ${!params.category ? "active" : ""}`}>
              همه دسته‌ها
            </Link>
            {FEEDBACK_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={filterHref(current, { category })}
                className={`fb-filter ${params.category === category ? "active" : ""}`}
              >
                {CATEGORY_LABELS[category]}
              </Link>
            ))}
          </div>
          <div className="fb-filters" aria-label="فیلتر وضعیت">
            <Link href={filterHref(current, { status: undefined })} className={`fb-filter ${!params.status ? "active" : ""}`}>
              همه وضعیت‌ها
            </Link>
            {FEEDBACK_STATUSES.map((status) => (
              <Link
                key={status}
                href={filterHref(current, { status })}
                className={`fb-filter ${params.status === status ? "active" : ""}`}
              >
                {STATUS_LABELS[status]}
              </Link>
            ))}
          </div>
        </div>
        <p className="fb-count">
          {filtered ? `${faNumber(posts.length)} نتیجه` : `${faNumber(posts.length)} فید‌بک`}
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="fb-grid">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              signedIn={Boolean(viewer)}
              nextPath={filtered ? filterHref(current, {}) : "/feed"}
            />
          ))}
        </div>
      ) : (
        <div className="fb-empty">
          <strong>هنوز فید‌بک‌ی با این فیلتر نیست.</strong>
          فیلتر را عوض کن یا اولین فید‌بک را ثبت کن.
          <div style={{ marginTop: 14 }}>
            <ComposerButton className="fb-btn fb-btn-primary">ثبت فید‌بک</ComposerButton>
          </div>
        </div>
      )}
    </>
  );
}
