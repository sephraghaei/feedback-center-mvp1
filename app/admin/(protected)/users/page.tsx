import type { Metadata } from "next";
import UserManagement from "../../components/user-management";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = translator(await getLocale());
  return { title: t("مدیریت کاربران | وسا", "Users | Vasa") };
}

export default function AdminUsersPage() {
  return <UserManagement />;
}
