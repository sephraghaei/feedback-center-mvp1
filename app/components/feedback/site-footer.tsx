import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";

const COLUMNS = [
  {
    title: "Product",
    links: [{ href: "/", label: "Public boards" }],
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Log in or sign up" },
      { href: "/profile", label: "My profile" },
      { href: "/requests", label: "Your posts" },
    ],
  },
  {
    title: "For companies",
    links: [
      { href: "/workspace", label: "Company workspace" },
      { href: "/", label: "How Vasa works" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-col">
            <Link href="/" className="footer-brand" aria-label="Vasa home">
              <BrandMark className="footer-mark" simple />
              <span className="footer-name">Vasa</span>
            </Link>
            <p className="footer-tagline">
              Collect feedback, let customers vote, and keep a public roadmap that tells them
              what shipped.
            </p>
            <Link href="/workspace" className="footer-cta">
              Open the company panel
            </Link>
          </div>

          <nav className="footer-nav" aria-label="Footer links">
            {COLUMNS.map((column) => (
              <div key={column.title} className="footer-col">
                <h2 className="footer-col-title">{column.title}</h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link href={link.href} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Vasa. All rights reserved.</span>
          <span className="footer-note">Built so customers get heard</span>
        </div>
      </div>
    </footer>
  );
}
