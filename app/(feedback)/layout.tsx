import "../feedback.css";
import FeedbackHeader from "@/app/components/feedback/feedback-header";
import SiteFooter from "@/app/components/feedback/site-footer";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

export default async function FeedbackLayout({ children }: { children: React.ReactNode }) {
  const [viewer, admin] = await Promise.all([getViewer(), isAdminRequest()]);
  const headerViewer = viewer
    ? { name: viewer.name, role: viewer.role, method: viewer.method, avatarPath: viewer.avatarPath }
    : null;

  return (
    <div className="fb-shell">
      <div className="top-strip" aria-hidden="true" />
      <FeedbackHeader viewer={headerViewer} admin={admin} />
      <main className="fb-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
