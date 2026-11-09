import { redirect } from "next/navigation";
import { adminPasswordConfigured, getAdminSession } from "@/lib/admin-auth";
import LoginForm from "../components/login-form";
import "../admin.css";

export const metadata = { title: "ورود مدیر | Feedback-center" };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <LoginForm configured={adminPasswordConfigured()} />;
}