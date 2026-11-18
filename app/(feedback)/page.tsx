import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import AuthFlow from "@/app/components/auth-flow";
import HomeStory from "@/app/components/feedback/home-story";
import PointerFx from "@/app/components/feedback/pointer-fx";
import ScrollReveal from "@/app/components/feedback/scroll-reveal";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import { listCompanies } from "@/lib/companies";
import { formatNumber } from "@/lib/feedback/labels";
import { getViewer } from "@/lib/feedback/viewer";
import { getProfile } from "@/lib/user-store";

export const metadata: Metadata = {
  title: "Vasa | Customer feedback boards",
  description:
    "Customers post ideas on a public board, vote on what matters, and follow the roadmap. Companies get a workspace to triage and ship.",
};

const MODES = [
  {
    id: "customers",
    label: "For customers",
    title: "Say what you need, then watch it happen",
    points: [
      "One board per company, sorted by votes or by newest.",
      "Post a bug, an idea or a compliment in under a minute.",
      "Follow the status from New to Shipped without asking anyone.",
    ],
    href: "#boards",
    link: "Find a board",
  },
  {
    id: "companies",
    label: "For companies",
    title: "A workspace behind every public board",
    points: [
      "Triage new feedback and move it along a public roadmap.",
      "Publish updates that mark the linked feedback as shipped.",
      "Invite teammates and match the board to your brand accent.",
    ],
    href: "/workspace",
    link: "Open the workspace",
  },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const requestedNext = params.next;
  const nextPath =
    requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : undefined;

  const viewer = await getViewer();
  if (viewer && nextPath) redirect(nextPath);

  const companies = await listCompanies();
  const profile = viewer ? await getProfile(viewer.userId) : null;
  const status = !viewer ? "guest" : profile ? "ready" : "needs-profile";

  return (
    <div className="fb-home fb-landing">
      <PointerFx />
      <ScrollReveal />
      <section className="fb-hero" data-cursor>
        <div className="fb-hero-aura" aria-hidden="true">
          <span className="fb-aura-glow" />
          <span className="fb-aura-grid" />
        </div>
        <div className="fb-hero-inner">
          <span className="fb-landing-kicker">
            <span className="fb-landing-dot" aria-hidden="true" />
            Customer feedback, end to end
          </span>
          <h1 className="fb-title">Ship what customers actually ask for.</h1>
          <p className="fb-lede">
            Vasa gives every company a public board where customers post ideas, vote on what
            matters, and follow the roadmap. The company team gets a workspace behind it to
            triage, plan and publish.
          </p>
          <div className="fb-hero-actions">
            <Link href="#boards" className="fb-btn fb-btn-primary">
              Browse boards
            </Link>
            <Link href="/workspace" className="fb-btn">
              Company panel
            </Link>
          </div>
          <div className="fb-hero-demo" data-tilt aria-hidden="true">
            <span className="fb-demo-vote">
              <span className="fb-demo-arrow" />
              <strong>42</strong>
              <span className="fb-demo-vote-label">votes</span>
            </span>
            <span className="fb-demo-copy">
              <strong>Dark mode for the public board</strong>
              <span>Posted by a customer, 12 comments</span>
            </span>
            <span className="fb-demo-status">
              <span>New</span>
              <span>Planned</span>
              <span>Shipped</span>
            </span>
          </div>
        </div>
      </section>

      <div className="fb-modes" id="modes">
        {MODES.map((mode, index) => (
          <article
            key={mode.id}
            className="fb-mode"
            data-reveal
            style={{ "--i": index } as CSSProperties}
          >
            <span className="fb-mode-label">{mode.label}</span>
            <h2>{mode.title}</h2>
            <ul>
              {mode.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <Link href={mode.href} className="fb-mode-link">
              {mode.link}
              <span className="fb-mode-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </article>
        ))}
      </div>

      <HomeStory slug={companies[0]?.slug} />

      <section className="fb-section" id="boards" aria-labelledby="boards-title">
        <div className="fb-section-head" data-reveal>
          <div>
            <h2 id="boards-title" className="fb-section-title">
              Public boards
            </h2>
            <p className="fb-section-sub">
              {companies.length === 0
                ? "Boards show up here as soon as a company joins."
                : companies.length === 1
                  ? "One company is collecting feedback right now."
                  : `${formatNumber(companies.length)} companies are collecting feedback right now.`}
            </p>
          </div>
        </div>

        {companies.length > 0 ? (
          <div className="fb-board-links">
            {companies.map((company, index) => (
              <Link
                key={company.id}
                href={`/c/${company.slug}`}
                className="fb-board-link"
                data-reveal
                style={
                  {
                    "--board-accent": company.accent,
                    "--i": index,
                  } as CSSProperties
                }
              >
                <span className="fb-board-mark" aria-hidden="true">
                  {company.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="fb-board-text">
                  <strong>{company.name}</strong>
                  <span>{company.tagline ?? "Feedback board"}</span>
                </span>
                <span className="fb-board-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="fb-empty">
            <strong>No boards yet.</strong>
            Companies open their first board from the workspace.
            <div className="fb-empty-action">
              <Link href="/workspace" className="fb-btn fb-btn-primary fb-btn-sm">
                Open the workspace
              </Link>
            </div>
          </div>
        )}
      </section>

      <section id="account" className="fb-section" aria-labelledby="account-title">
        <div className="fb-section-head" data-reveal>
          <div>
            <h2 id="account-title" className="fb-section-title">
              Your account
            </h2>
            <p className="fb-section-sub">
              One account works across every board and the company workspace.
            </p>
          </div>
        </div>

        {viewer ? (
          <div className="fb-account" data-reveal>
            <p className="fb-account-greeting">Welcome back, {viewer.name}</p>
            <div className="fb-hero-actions">
              <Link href="/requests" className="fb-btn fb-btn-primary">
                Your posts
              </Link>
              <Link href="/profile" className="fb-btn">
                My profile
              </Link>
              <Link href="/workspace" className="fb-btn fb-btn-ghost">
                Workspace
              </Link>
              {viewer.role === "admin" ? (
                <Link href="/admin" className="fb-btn fb-btn-ghost">
                  Admin
                </Link>
              ) : null}
            </div>
            <div className="fb-account-foot">
              {viewer.method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
            </div>
          </div>
        ) : (
          <div className="fb-account" data-reveal>
            <p className="fb-lede">
              Log in with your email or Google account to post feedback and vote.
            </p>
            <AuthFlow status={status} nextPath={nextPath} />
          </div>
        )}
      </section>
    </div>
  );
}
