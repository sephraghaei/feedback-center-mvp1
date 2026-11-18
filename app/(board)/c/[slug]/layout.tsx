import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandMark from "@/app/components/brand-mark";
import BoardHeader from "@/app/components/board/board-header";
import "../../../feedback.css";
import "../../../board.css";
import { getCompanyBySlug, getMembership } from "@/lib/companies";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

export default async function BoardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const [viewer, admin] = await Promise.all([getViewer(), isAdminRequest()]);
  const member = viewer
    ? admin || Boolean(await getMembership(company.id, viewer.userId))
    : false;

  const style = { "--company-accent": company.accent } as CSSProperties;

  return (
    <div className="bd-shell" style={style}>
      <div className="top-strip" aria-hidden="true" />
      <BoardHeader
        company={{ slug: company.slug, name: company.name, tagline: company.tagline }}
        viewerName={viewer?.name ?? null}
        member={member}
      />
      <main className="bd-main">{children}</main>
      <footer className="bd-footer">
        <div className="bd-footer-inner">
          <Link href="/" className="bd-footer-brand">
            <BrandMark className="nav-mark" simple />
            Powered by Vasa
          </Link>
          <div className="bd-footer-links">
            <Link href={`/c/${company.slug}/roadmap`}>Roadmap</Link>
            <Link href={`/c/${company.slug}/updates`}>Updates</Link>
            <Link href="/workspace">For companies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
