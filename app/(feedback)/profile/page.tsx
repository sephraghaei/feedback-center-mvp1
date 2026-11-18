import type { Metadata } from "next";
import Link from "next/link";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import CountUp from "@/app/components/feedback/count-up";
import PostCard from "@/app/components/feedback/post-card";
import ProfileEditor from "@/app/components/feedback/profile-editor";
import { formatDate, formatNumber } from "@/lib/feedback/labels";
import { getProfileStats, listMyPosts } from "@/lib/feedback/posts";
import { requireViewer } from "@/lib/feedback/viewer";
import { getProfile } from "@/lib/user-store";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

const METHOD_LABELS: Record<string, [string, string]> = {
  phone: ["ورود با شماره موبایل", "Signed in with mobile"],
  email: ["ورود با ایمیل", "Signed in with email"],
  clerk: ["ورود با ایمیل یا گوگل", "Signed in with email or Google"],
};

export async function generateMetadata(): Promise<Metadata> {
  const t = translator(await getLocale());
  return {
    title: t("پروفایل من | وسا", "My profile | Vasa"),
    description: t(
      "عکس و معرفی‌ات رو عوض کن و فیدبک‌هات رو یک جا ببین.",
      "Change your photo and bio, and see your feedback in one place.",
    ),
  };
}

export default async function ProfilePage() {
  const viewer = await requireViewer("/profile");
  const [profile, posts, stats] = await Promise.all([
    getProfile(viewer.userId),
    listMyPosts(viewer.userId),
    getProfileStats(viewer.userId),
  ]);

  const locale = await getLocale();
  const t = translator(locale);
  const publicPosts = posts.filter((post) => post.type === "feedback" && !post.hidden);
  const method = METHOD_LABELS[viewer.method];

  return (
    <div className="fb-profile-page">
      <section className="fb-profile-summary" aria-label={t("پروفایل", "Profile")}>
        <ProfileEditor
          profile={{
            name: profile?.name ?? viewer.name,
            bio: profile?.bio ?? "",
            company: profile?.company ?? "",
            age: profile?.age ? String(profile.age) : "",
            sex: profile?.sex ?? "",
            avatarPath: profile?.avatarPath ?? null,
          }}
          joinedLabel={formatDate(viewer.joinedAt, locale)}
          contact={viewer.contact}
          roleLabel={viewer.role === "admin" ? t("مدیر", "Admin") : null}
        >
          <Link href="/requests" className="fb-btn">
            {t("درخواست‌های من", "Your posts")}
          </Link>
          <Link href="/" className="fb-btn fb-btn-ghost">
            {t("دیدن بردها", "Browse boards")}
          </Link>
        </ProfileEditor>

        <dl className="fb-profile-stats">
          <div>
            <dt>{t("فیدبک", "Feedback")}</dt>
            <dd>
              <CountUp value={stats.feedback} />
            </dd>
          </div>
          <div>
            <dt>{t("رأی گرفته", "Votes received")}</dt>
            <dd>
              <CountUp value={stats.votes} />
            </dd>
          </div>
          <div>
            <dt>{t("کامنت", "Comments")}</dt>
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
              {t("فیدبک‌های من", "My feedback")}
            </h2>
            <p className="fb-section-sub">
              {publicPosts.length > 0
                ? t("آخرین چیزهایی که نوشتی، با وضعیتشون.", "Your latest posts, with the current status.")
                : t("هنوز فیدبک عمومی ننوشتی. اولین مورد رو بنویس.", "No public feedback yet. Post the first one.")}
            </p>
          </div>
          {publicPosts.length > 0 ? (
            <Link href="/requests" className="fb-link">
              {t(`${formatNumber(publicPosts.length, locale)} مورد`, `${formatNumber(publicPosts.length, locale)} items`)}
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
            <strong>{t("هنوز این‌جا خالیه.", "Nothing here yet.")}</strong>
            {t(
              "اولین فیدبکت رو بنویس تا با وضعیتش همین‌جا بیاد.",
              "Post your first feedback and it shows up here with its status.",
            )}
            <div className="fb-empty-action">
              <Link href="/" className="fb-btn fb-btn-primary fb-btn-sm">
                {t("دیدن بردها", "Browse boards")}
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="fb-section fb-profile-account" aria-labelledby="profile-account">
        <div>
          <h2 id="profile-account" className="fb-section-title">
            {t("راه ورود", "Sign-in method")}
          </h2>
          <p className="fb-section-sub">
            {method ? t(method[0], method[1]) : t("ورود به حساب", "Account login")}
            {viewer.contact ? ` · ${viewer.contact}` : ""}
          </p>
        </div>
        {viewer.method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
      </section>
    </div>
  );
}
