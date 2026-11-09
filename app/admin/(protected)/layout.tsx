import { requireAdmin } from "@/lib/admin-auth";
import { getUserCount } from "@/lib/admin-store";
import AdminShell from "../components/admin-shell";
import "../admin.css";

export const metadata = { title: "پنل مدیریت | Feedback-center" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const userCount = await getUserCount();
  return <AdminShell userCount={userCount}>{children}</AdminShell>;
}