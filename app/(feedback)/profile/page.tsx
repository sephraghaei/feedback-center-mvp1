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

export const metadata: Metadata = {
  title: "My profile | Vasa",
  description: "Change your photo and bio, and see your feedback in one place.",
};

const METHOD_LABELS: Record<string, string> = {
  phone: "Signed in with mobile",
  email: "Signed in with email",
  clerk: "Signed in with email or Google",
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
      <section className="fb-profile-summary" aria-label="Profile">
        <ProfileEditor
          profile={{
            name: profile?.name ?? viewer.name,
            bio: profile?.bio ?? "",
            company: profile?.company ?? "",
            age: profile?.age ? String(profile.age) : "",
            sex: profile?.sex ?? "",
            avatarPath: profile?.avatarPath ?? null,
          }}
          joinedLabel={formatDate(viewer.joinedAt)}
          contact={viewer.contact}
          roleLabel={viewer.role === "admin" ? "Admin" : null}
        >
          <Link href="/requests" className="fb-btn">
            Your posts
          </Link>
          <Link href="/" className="fb-btn fb-btn-ghost">Browse boards</Link>
        </ProfileEditor>

        <dl className="fb-profile-stats">
          <div>
            <dt>Feedback</dt>
            <dd>
              <CountUp value={stats.feedback} />
            </dd>
          </div>
          <div>
            <dt>Votes received</dt>
            <dd>
              <CountUp value={stats.votes} />
            </dd>
          </div>
          <div>
            <dt>Comments</dt>
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
              My feedback
            </h2>
            <p className="fb-section-sub">
              {publicPosts.length > 0
                ? "Your latest posts, with the current status."
                : "No public feedback yet. Post the first one."}
            </p>
          </div>
          {publicPosts.length > 0 ? (
            <Link href="/requests" className="fb-link">
              {formatNumber(publicPosts.length)} items
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
            <strong>Nothing here yet.</strong>
            Post your first feedback and it shows up here with its status.
            <div className="fb-empty-action">
              <Link href="/" className="fb-btn fb-btn-primary fb-btn-sm">
                Browse boards
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="fb-section fb-profile-account" aria-labelledby="profile-account">
        <div>
          <h2 id="profile-account" className="fb-section-title">
            Sign-in method
          </h2>
          <p className="fb-section-sub">
            {METHOD_LABELS[viewer.method] ?? "Account login"}
            {viewer.contact ? ` · ${viewer.contact}` : ""}
          </p>
        </div>
        {viewer.method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
      </section>
    </div>
  );
}
