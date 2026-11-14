import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "./supabase/server";

export type Viewer = {
  user: User | null;
  profile: { id: string; display_name: string | null; role: "user" | "platform_admin" } | null;
  isAdmin: boolean;
  memberships: { business_id: string; role: "owner" | "editor" }[];
  unread: number;
};

export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, isAdmin: false, memberships: [], unread: 0 };
  }

  const [{ data: profile }, { data: memberships }, { count: unread }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, role")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("business_members")
      .select("business_id, role")
      .eq("user_id", user.id),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("channel", "in_app")
      .is("read_at", null),
  ]);

  return {
    user,
    profile: profile ?? null,
    isAdmin: profile?.role === "platform_admin",
    memberships: memberships ?? [],
    unread: unread ?? 0,
  };
});

export async function requireUser(nextPath = "/feed") {
  const viewer = await getViewer();
  if (!viewer.user) {
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  }
  return viewer;
}

export async function requireAdmin() {
  const viewer = await getViewer();
  if (!viewer.user) redirect("/sign-in?next=%2Fadmin");
  if (!viewer.isAdmin) notFound();
  return viewer;
}

export async function requireMembership(businessId: string) {
  const viewer = await requireUser(`/manage/${businessId}`);
  const membership = viewer.memberships.find((item) => item.business_id === businessId);
  if (!membership) notFound();
  return { viewer, membership };
}
