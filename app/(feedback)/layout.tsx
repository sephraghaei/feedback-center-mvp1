import "../feedback.css";
import BrandMark from "@/app/components/brand-mark";
import Composer from "@/app/components/feedback/composer";
import FeedbackHeader from "@/app/components/feedback/feedback-header";
import PointerFx from "@/app/components/feedback/pointer-fx";
import ScrollProgress from "@/app/components/feedback/scroll-progress";
import SiteTour from "@/app/components/feedback/site-tour";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

export default async function FeedbackLayout({ children }: { children: React.ReactNode }) {
  const [viewer, admin] = await Promise.all([getViewer(), isAdminRequest()]);
  const headerViewer = viewer
    ? { name: viewer.name, role: viewer.role, method: viewer.method }
    : null;

  return (
    <div className="fb-shell">
      <ScrollProgress />
      <div className="top-strip" aria-hidden="true" />
      <FeedbackHeader viewer={headerViewer} admin={admin} />
      <main className="fb-main">{children}</main>
      <footer className="site-footer">
        <span className="footer-brand">
          <BrandMark className="footer-mark" simple />
          <span className="footer-name">وسا</span>
        </span>
        <span>بازخورد، نقشه راه و تغییرات در یک جا</span>
      </footer>
      <Composer viewer={headerViewer} />
      <PointerFx />
      <SiteTour />
    </div>
  );
}
