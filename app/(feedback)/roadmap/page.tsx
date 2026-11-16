import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import ComposerButton from "@/app/components/feedback/composer-button";
import MoveMenu from "@/app/components/feedback/move-menu";
import { STATUS_LABELS, faNumber } from "@/lib/feedback/labels";
import { ROADMAP_STATUSES, listRoadmap } from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

export const metadata: Metadata = {
  title: "نقشه راه، به زودی | وسا",
  description: "نقشه راه وسا در دست توسعه است و به زودی می‌آید. تا آن موقع فید‌بک‌ها و وضعیتشان را دنبال کن.",
};

const COLUMN_HINTS: Record<string, string> = {
  planned: "پذیرفته شده و در نوبت",
  in_progress: "همین حالا روی آن کار می‌کنیم",
  shipped: "منتشر شده و در دسترس",
};

export default async function RoadmapPage() {
  const [viewer, admin] = await Promise.all([getViewer(), isAdminRequest()]);
  const posts = await listRoadmap(viewer?.userId);
  const groups = ROADMAP_STATUSES.map((status) => ({
    status,
    items: posts.filter((post) => post.status === status),
  }));

  return (
    <>
      <section className="fb-hero">
        <p className="fb-eyebrow">
          <BrandMark className="eyebrow-mark" simple />
          نقشه راه{" "}
          <span className="fb-soon">به زودی</span>
        </p>
        <h1 className="fb-title">نقشه راه، به زودی میاد</h1>
        <p className="fb-lede">
          داریم نقشه راه رو می‌سازیم تا هر درخواست از نوبت تا انتشار یه مسیر روشن داشته باشه. تا
          آماده شدنش، فید‌بک‌ها رو بخون، بهشون رای بده و وضعیت هر کدوم رو دنبال کن.
        </p>
        <div className="fb-hero-actions">
          <ComposerButton className="fb-btn fb-btn-primary">ثبت فید‌بک تازه</ComposerButton>
          <Link href="/feed" className="fb-btn">
            همه فید‌بک‌ها
          </Link>
        </div>
        <p className="fb-soon-note">
          <span className="fb-soon">به زودی</span>{" "}
          <span>
            نقشه راه هنوز در دست توسعه‌ست و چیدمانش تا نسخه نهایی ممکنه عوض بشه. پایین‌تر فقط یه
            پیش‌نمایش از ستون‌هاست.
          </span>
        </p>
        {admin ? (
          <p className="field-hint">تو مدیر هستی: از منوی هر کارت می‌توانی ستونش را عوض کنی.</p>
        ) : null}
      </section>

      <p className="field-hint fb-board-caption">پیش‌نمایش ستون‌ها با فید‌بک‌های فعلی</p>

      <div className="fb-board">
        {groups.map((group) => (
          <section key={group.status} className="fb-column" aria-label={STATUS_LABELS[group.status]}>
            <div className="fb-column-head">
              <h2>{STATUS_LABELS[group.status]}</h2>
              <span>{faNumber(group.items.length)}</span>
            </div>
            <p className="field-hint" style={{ margin: "0 4px" }}>
              {COLUMN_HINTS[group.status]}
            </p>
            {group.items.length > 0 ? (
              group.items.map((post) => (
                <article key={post.id} className="fb-mini" data-spotlight>
                  <Link href={`/p/${post.id}`} className="fb-mini-title">
                    {post.title}
                  </Link>
                  <div className="fb-mini-meta">
                    <span>{faNumber(post.upvotes)} رای</span>
                  </div>
                  {admin ? <MoveMenu postId={post.id} status={post.status} /> : null}
                </article>
              ))
            ) : (
              <p className="fb-column-empty">هنوز چیزی اینجا نیست.</p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
