import { requireAdmin } from "@/lib/admin-auth";
import { getAdminStats } from "@/lib/admin-store";
import AdminShell from "../components/admin-shell";
import "../admin.css";

export const metadata = { title: "پنل مدیریت | Feedback-center" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const stats = await getAdminStats();
  return <AdminShell userCount={stats.totalUsers}>{children}</AdminShell>;
}