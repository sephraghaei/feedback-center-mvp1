import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import ComposerButton from "@/app/components/feedback/composer-button";
import CountUp from "@/app/components/feedback/count-up";
import CompanyFilter from "@/app/components/feedback/company-filter";
import PostCard from "@/app/components/feedback/post-card";
import { faNumber } from "@/lib/feedback/labels";
import { listFeed, listFeedCompanies } from "@/lib/feedback/posts";
import { getViewer } from "@/lib/feedback/viewer";

export const metadata: Metadata = {
  title: "فید‌بک‌ها | وسا",
  description: "ایده‌ها و فید‌بک‌های محصولات رو ببین، به مهم‌ها رای بده و وضعیتشون رو دنبال کن.",
};

type Search = { company?: string; sort?: string };

function feedHref(current: Search, patch: Search): string {
  const next = { ...current, ...patch };
  const query = new URLSearchParams();
  if (next.company) query.set("company", next.company);
  if (next.sort === "newest") query.set("sort", "newest");
  const text = query.toString();
  return text ? `/feed?${text}` : "/feed";
}

export default async function FeedPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const viewer = await getViewer();
  const sort = params.sort === "newest" ? "newest" : "votes";
  const [posts, companies] = await Promise.all([
    listFeed({
      product: params.company,
      sort,
      viewerId: viewer?.userId,
    }),
    listFeedCompanies(),
  ]);

  const current: Search = {
    company: params.company,
    sort: sort === "newest" ? "newest" : undefined,
  };
  const filtered = Boolean(params.company);

  return (
    <>
      <section className="fb-hero fb-page-head">
        <p className="fb-eyebrow">
          <BrandMark className="eyebrow-mark" simple />
          فید‌بک‌ها
        </p>
        <h1 className="fb-title">همه ایده‌ها، یک جا</h1>
        <p className="fb-lede">
          فید‌بک‌ها رو بخون، به مهم‌ها رای بده و وضعیت هر کدوم رو ببین. نوشتن فقط یک حساب
          می‌خواد.
        </p>
        <div className="fb-hero-actions">
          <ComposerButton className="fb-btn fb-btn-primary">فید‌بک بده</ComposerButton>
          <Link href="/roadmap" className="fb-btn">
            نقشه راه
          </Link>
        </div>
        <ul className="fb-hero-stats">
          <li>
            <strong>
              <CountUp value={posts.length} />
            </strong>{" "}
            فید‌بک در این نما
          </li>
          <li>خواندن برای همه آزاده</li>
        </ul>
      </section>

      <div className="fb-toolbar-row">
        <div className="fb-toolbar-filters">
          <CompanyFilter
            companies={companies}
            selected={params.company}
            sort={sort === "newest" ? "newest" : undefined}
          />

          <div className="fb-sort" aria-label="ترتیب فید‌بک‌ها">
            <span className="fb-sort-label">ترتیب</span>
            <Link
              href={feedHref(current, { sort: undefined })}
              className={`fb-filter ${sort === "votes" ? "active" : ""}`}
            >
              بیشترین رای
            </Link>
            <Link
              href={feedHref(current, { sort: "newest" })}
              className={`fb-filter ${sort === "newest" ? "active" : ""}`}
            >
              تازه‌ها
            </Link>
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
              nextPath={feedHref(current, {})}
            />
          ))}
        </div>
      ) : (
        <div className="fb-empty">
          <strong>هنوز فید‌بکی با این فیلتر نیست.</strong>
          فیلتر رو عوض کن یا اولین فید‌بک رو بنویس.
          <div className="fb-empty-action">
            <ComposerButton className="fb-btn fb-btn-primary fb-btn-sm">فید‌بک بده</ComposerButton>
          </div>
        </div>
      )}
    </>
  );
}
