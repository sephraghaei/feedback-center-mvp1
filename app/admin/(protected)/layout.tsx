import { requireAdmin } from "@/lib/admin-auth";
import { getUserCount } from "@/lib/admin-store";
import { countFeedback, countOpenSupport } from "@/lib/feedback/posts";
import AdminShell from "../components/admin-shell";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import "../admin.css";

export async function generateMetadata() {
  const t = translator(await getLocale());
  return { title: t("پنل مدیریت | وسا", "Admin panel | Vasa") };
}

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
