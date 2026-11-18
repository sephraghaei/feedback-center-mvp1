import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import ComposerButton from "./composer-button";
import TourTrigger from "./tour-trigger";

const COLUMNS = [
  {
    title: "محصول",
    links: [
      { href: "/feed", label: "فیدبک‌ها" },
      { href: "/roadmap", label: "نقشه راه" },
      { href: "/changelog", label: "تغییرات" },
    ],
  },
  {
    title: "حساب",
    links: [
      { href: "/sign-in", label: "ورود یا ثبت‌نام" },
      { href: "/profile", label: "پروفایل من" },
      { href: "/requests", label: "درخواست‌های من" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-col">
            <Link href="/" className="footer-brand" aria-label="وسا، صفحه اصلی">
              <BrandMark className="footer-mark" simple />
              <span className="footer-name">وسا</span>
            </Link>
            <p className="footer-tagline">
              ایده‌ها رو جمع می‌کنیم، با رأی شما مرتبشون می‌کنیم و تا انتشار دنبالشون
              می‌مونیم.
            </p>
            <ComposerButton className="footer-cta">فیدبک بده</ComposerButton>
          </div>

          <nav className="footer-nav" aria-label="پیوندهای پاصفحه">
            {COLUMNS.map((column) => (
              <div key={column.title} className="footer-col">
                <h2 className="footer-col-title">{column.title}</h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="footer-col">
              <h2 className="footer-col-title">راهنما</h2>
              <ul>
                <li>
                  <Link href="/#story-title" className="footer-link">
                    داستان یک فیدبک
                  </Link>
                </li>
                <li>
                  <Link href="/#account" className="footer-link">
                    حساب و ورود
                  </Link>
                </li>
                <li>
                  <TourTrigger className="footer-link" />
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© ۱۴۰۵ وسا. همه حقوق محفوظ است.</span>
          <span className="footer-note">ساخته‌شده برای شنیده شدن</span>
        </div>
      </div>
    </footer>
  );
}
