import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import { getT } from "@/lib/i18n/server";

export default async function SiteFooter() {
  const t = await getT();

  const columns = [
    {
      title: t("محصول", "Product"),
      links: [{ href: "/", label: t("بردهای عمومی", "Public boards") }],
    },
    {
      title: t("حساب", "Account"),
      links: [
        { href: "/sign-in", label: t("ورود یا ثبت‌نام", "Log in or sign up") },
        { href: "/profile", label: t("پروفایل من", "My profile") },
        { href: "/requests", label: t("نوشته‌های من", "Your posts") },
      ],
    },
    {
      title: t("برای شرکت‌ها", "For companies"),
      links: [
        { href: "/workspace", label: t("پنل شرکت", "Company workspace") },
        { href: "/", label: t("وسا چطور کار می‌کند", "How Vasa works") },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-col">
            <Link href="/" className="footer-brand" aria-label={t("صفحه اصلی وسا", "Vasa home")}>
              <BrandMark className="footer-mark" simple />
              <span className="footer-name">{t("وسا", "Vasa")}</span>
            </Link>
            <p className="footer-tagline">
              {t(
                "فیدبک رو جمع کن، بذار مشتری‌ها رأی بدن و یک نقشه راه عمومی نگه دار که بگه چی منتشر شده.",
                "Collect feedback, let customers vote, and keep a public roadmap that tells them what shipped.",
              )}
            </p>
            <Link href="/workspace" className="footer-cta">
              {t("باز کردن پنل شرکت", "Open the company panel")}
            </Link>
          </div>

          <nav className="footer-nav" aria-label={t("پیوندهای پاصفحه", "Footer links")}>
            {columns.map((column) => (
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
          <span>{t("© ۱۴۰۵ وسا. همه حقوق محفوظ است.", "© 2026 Vasa. All rights reserved.")}</span>
          <span className="footer-note">{t("ساخته شده برای شنیده شدن", "Built so customers get heard")}</span>
        </div>
      </div>
    </footer>
  );
}
