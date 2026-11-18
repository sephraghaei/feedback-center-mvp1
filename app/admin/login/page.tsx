import { redirect } from "next/navigation";
import { adminPasswordConfigured, getAdminSession } from "@/lib/admin-auth";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import LoginForm from "../components/login-form";
import "../admin.css";

export async function generateMetadata() {
  const t = translator(await getLocale());
  return { title: t("ورود مدیر | وسا", "Admin sign-in | Vasa") };
}

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <LoginForm configured={adminPasswordConfigured()} />;
}