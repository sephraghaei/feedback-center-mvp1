"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientLogger } from "@/lib/client-logger";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }
      clientLogger.info("ui.auth.logout");
      router.refresh();
    } catch (issue) {
      clientLogger.error("ui.auth.logout_failed", { error: issue });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="ghost" onClick={logout} disabled={loading}>
      {loading ? "در حال خروج..." : "خروج از حساب"}
    </button>
  );
}

export function ClerkSignOutButton() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await signOut();
      clientLogger.info("ui.auth.clerk_logout");
      router.refresh();
    } catch (issue) {
      clientLogger.error("ui.auth.clerk_logout_failed", { error: issue });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="ghost" onClick={logout} disabled={loading}>
      {loading ? "در حال خروج..." : "خروج از حساب"}
    </button>
  );
}
