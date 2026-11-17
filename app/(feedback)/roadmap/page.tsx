import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import ComposerButton from "@/app/components/feedback/composer-button";
import MoveMenu from "@/app/components/feedback/move-menu";
import { STATUS_LABELS, faNumber } from "@/lib/feedback/labels";
import { ROADMAP_STATUSES, listRoadmap } from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

export const metadata: Metadata = {
  title: "نقشه راه | وسا",
  description: "مسیر فید‌بک‌ها از نوبت تا انتشار: چی در صف ساخت است، چی در حال ساخت و چی منتشر شده.",
};

const COLUMN_HINTS: Record<string, string> = {
  planned: "در نوبت ساخت",
  in_progress: "همین حالا داریم روش کار می‌کنیم",
  shipped: "منتشر شده و در دسترسه",
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
      <section className="fb-hero fb-page-head">
        <p className="fb-eyebrow">
          <BrandMark className="eyebrow-mark" simple />
          نقشه راه
        </p>
        <h1 className="fb-title">از نوبت تا انتشار</h1>
        <p className="fb-lede">
          فید‌بک‌های پررأی میان صف ساخت، بعد ساخته و منتشر می‌شن. وضعیت هر کدوم رو همین‌جا
          ببین.
        </p>
        <div className="fb-hero-actions">
          <ComposerButton className="fb-btn fb-btn-primary">فید‌بک بده</ComposerButton>
          <Link href="/feed" className="fb-btn">
            همه فید‌بک‌ها
          </Link>
        </div>
        {admin ? (
          <p className="field-hint">تو مدیر هستی؛ از منوی هر کارت می‌تونی ستونش رو عوض کنی.</p>
        ) : null}
      </section>

      <div className="fb-board">
        {groups.map((group) => (
          <section key={group.status} className="fb-column" aria-label={STATUS_LABELS[group.status]}>
            <div className="fb-column-head">
              <h2>{STATUS_LABELS[group.status]}</h2>
              {group.items.length > 0 ? <span>{faNumber(group.items.length)}</span> : null}
            </div>
            <p className="field-hint fb-column-hint">{COLUMN_HINTS[group.status]}</p>
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
