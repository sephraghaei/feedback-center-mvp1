import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import AuthFlow from "@/app/components/auth-flow";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import { listCompanies } from "@/lib/companies";
import { OTP_LENGTH } from "@/lib/config";
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

const STEPS = [
  {
    title: "Customers write",
    body: "A customer picks a board and posts an idea, a bug or a compliment.",
  },
  {
    title: "Everyone votes",
    body: "Votes and comments show the team what actually matters, not just what is loudest.",
  },
  {
    title: "The team ships",
    body: "The company moves the idea through the roadmap and publishes an update when it lands.",
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
      <section className="fb-hero">
        <div className="fb-hero-inner">
          <span className="fb-landing-kicker">Customer feedback, end to end</span>
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
        </div>
      </section>

      <div className="fb-modes" id="modes">
        {MODES.map((mode) => (
          <article key={mode.id} className="fb-mode">
            <span className="fb-mode-label">{mode.label}</span>
            <h2>{mode.title}</h2>
            <ul>
              {mode.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <Link href={mode.href} className="fb-mode-link">
              {mode.link} →
            </Link>
          </article>
        ))}
      </div>

      <section className="fb-section" id="boards" aria-labelledby="boards-title">
        <div className="fb-section-head">
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
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/c/${company.slug}`}
                className="fb-board-link"
                style={{ "--board-accent": company.accent } as CSSProperties}
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

      <section className="fb-section" aria-labelledby="steps-title">
        <div className="fb-section-head">
          <div>
            <h2 id="steps-title" className="fb-section-title">
              How it works
            </h2>
            <p className="fb-section-sub">One loop, from the first idea to the shipped note.</p>
          </div>
        </div>
        <ol className="fb-steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="fb-step">
              <span className="fb-step-num" aria-hidden="true">
                {index + 1}
              </span>
              <strong>{step.title}</strong>
              <span>{step.body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="account" className="fb-section" aria-labelledby="account-title">
        <div className="fb-section-head">
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
          <div className="fb-account">
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
          <div className="fb-account">
            <p className="fb-lede">
              Log in with your mobile, email or Google account to post feedback and vote.
            </p>
            <AuthFlow status={status} codeLength={OTP_LENGTH} nextPath={nextPath} />
          </div>
        )}
      </section>
    </div>
  );
}
