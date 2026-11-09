import { getAdminStats } from "@/lib/admin-store";
import Dashboard from "../components/dashboard";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  return <Dashboard stats={stats} />;
}