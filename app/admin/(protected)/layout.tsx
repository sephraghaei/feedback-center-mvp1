import { requireAdmin } from "@/lib/admin-auth";
import { getUserCount } from "@/lib/admin-store";
import { countFeedback, countOpenSupport } from "@/lib/feedback/posts";
import AdminShell from "../components/admin-shell";
import "../admin.css";

export const metadata = { title: "پنل مدیریت | وسا" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [userCount, openSupport, feedbackCount] = await Promise.all([
    getUserCount(),
    countOpenSupport(),
    countFeedback(),
  ]);
  return (
    <AdminShell userCount={userCount} openSupport={openSupport} feedbackCount={feedbackCount}>
      {children}
    </AdminShell>
  );
}
