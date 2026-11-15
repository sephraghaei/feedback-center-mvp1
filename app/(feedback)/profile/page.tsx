import type { Metadata } from "next";
import Link from "next/link";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import ComposerButton from "@/app/components/feedback/composer-button";
import CountUp from "@/app/components/feedback/count-up";
import PostCard from "@/app/components/feedback/post-card";
import ProfileEditor from "@/app/components/feedback/profile-editor";
import { faDate, faNumber } from "@/lib/feedback/labels";
import { getProfileStats, listMyPosts } from "@/lib/feedback/posts";
import { requireViewer } from "@/lib/feedback/viewer";
import { getProfile } from "@/lib/user-store";

export const metadata: Metadata = {
  title: "پروفایل من | وسا",
  description: "عکس، معرفی و اطلاعات حسابت را ویرایش کن و فید‌بک‌هایت را یک جا ببین.",
};

const METHOD_LABELS: Record<string, string> = {
  phone: "ورود با شماره موبایل",
  email: "ورود با ایمیل",
  clerk: "ورود با ایمیل یا گوگل",
};

export default async function ProfilePage() {
  const viewer = await requireViewer("/profile");
  const [profile, posts, stats] = await Promise.all([
    getProfile(viewer.userId),
    listMyPosts(viewer.userId),
    getProfileStats(viewer.userId),
  ]);

  const publicPosts = posts.filter((post) => post.type === "feedback" && !post.hidden);

  return (
    <div className="fb-profile-page">
      <section className="fb-profile-summary" aria-label="پروفایل">
        <ProfileEditor
          profile={{
            name: profile?.name ?? viewer.name,
            bio: profile?.bio ?? "",
            company: profile?.company ?? "",
            age: profile?.age ? String(profile.age) : "",
            sex: profile?.sex ?? "",
            avatarPath: profile?.avatarPath ?? null,
          }}
          joinedLabel={faDate(viewer.joinedAt)}
          contact={viewer.contact}
          roleLabel={viewer.role === "admin" ? "مدیر" : null}
        >
          <Link href="/requests" className="fb-btn">
            درخواست‌های من
          </Link>
          <ComposerButton className="fb-btn fb-btn-ghost">فید‌بک تازه</ComposerButton>
        </ProfileEditor>

        <dl className="fb-profile-stats">
          <div>
            <dt>فید‌بک</dt>
            <dd>
              <CountUp value={stats.feedback} />
            </dd>
          </div>
          <div>
            <dt>رای گرفته</dt>
            <dd>
              <CountUp value={stats.votes} />
            </dd>
          </div>
          <div>
            <dt>کامنت</dt>
            <dd>
              <CountUp value={stats.comments} />
            </dd>
          </div>
        </dl>
      </section>

      <section className="fb-section" aria-labelledby="profile-feedback">
        <div className="fb-section-head">
          <div>
            <h2 id="profile-feedback" className="fb-section-title">
              فید‌بک‌های من
            </h2>
            <p className="fb-section-sub">
              {publicPosts.length > 0
                ? "آخرین چیزهایی که نوشتی، با وضعیت به‌روزشان."
                : "هنوز فید‌بک عمومی ننوشتی. اولین مورد را ثبت کن."}
            </p>
          </div>
          {publicPosts.length > 0 ? (
            <Link href="/requests" className="fb-link">
              {faNumber(publicPosts.length)} مورد
            </Link>
          ) : null}
        </div>

        {publicPosts.length > 0 ? (
          <div className="fb-grid">
            {publicPosts.slice(0, 4).map((post) => (
              <PostCard key={post.id} post={post} signedIn nextPath="/profile" />
            ))}
          </div>
        ) : (
          <div className="fb-empty">
            <strong>این‌جا خالیه.</strong>
            با ثبت اولین فید‌بک، همین بخش پر می‌شود و وضعیتش را دنبال می‌کنی.
            <div className="fb-empty-action">
              <ComposerButton className="fb-btn fb-btn-primary fb-btn-sm">
                فید‌بک بنویس
              </ComposerButton>
            </div>
          </div>
        )}
      </section>

      <section className="fb-section fb-profile-account" aria-labelledby="profile-account">
        <div>
          <h2 id="profile-account" className="fb-section-title">
            راه ورود
          </h2>
          <p className="fb-section-sub">
            {METHOD_LABELS[viewer.method] ?? "ورود به حساب"}
            {viewer.contact ? ` · ${viewer.contact}` : ""}
          </p>
        </div>
        {viewer.method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
      </section>
    </div>
  );
}
