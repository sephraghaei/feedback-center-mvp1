import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAdminSession } from "../admin-auth";
import { getDb } from "../db";
import { profiles, users } from "../db/schema";
import { SESSION_COOKIE, readSession } from "../session";
import { ensureUserByClerkId } from "../user-store";

export type Viewer = {
  userId: string;
  name: string;
  role: "customer" | "admin";
  method: "phone" | "email" | "clerk";
  avatarPath: string | null;
  bio: string | null;
  joinedAt: Date;
  contact: string | null;
};

function maskContact(phone: string | null, email: string | null): string | null {
  if (phone) {
    return phone.length >= 8 ? `${phone.slice(0, 4)} *** ${phone.slice(-4)}` : phone;
  }
  if (email) {
    const [local, domain] = email.split("@");
    if (domain) return `${local.slice(0, 2)}***@${domain}`;
  }
  return null;
}

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const store = await cookies();
  const session = readSession(store.get(SESSION_COOKIE)?.value);

  let userId = session?.userId ?? null;
  let method: Viewer["method"] = session?.method ?? "phone";

  if (!userId) {
    const clerk = await auth();
    if (clerk.userId) {
      userId = await ensureUserByClerkId(clerk.userId);
      method = "clerk";
    }
  }

  if (!userId) return null;

  const [row] = await getDb()
    .select({
      role: users.role,
      email: users.email,
      phone: users.phone,
      joinedAt: users.createdAt,
      name: profiles.name,
      bio: profiles.bio,
      avatarPath: profiles.avatarPath,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;

  const fallback = row.email ? row.email.split("@")[0] : "Member";

  return {
    userId,
    name: row.name ?? fallback,
    role: row.role === "admin" ? "admin" : "customer",
    method,
    avatarPath: row.avatarPath ?? null,
    bio: row.bio ?? null,
    joinedAt: row.joinedAt,
    contact: maskContact(row.phone, row.email),
  };
});

export const isAdminRequest = cache(async (): Promise<boolean> => {
  const admin = await getAdminSession();
  if (admin) return true;
  const viewer = await getViewer();
  return viewer?.role === "admin";
});

export async function requireViewer(nextPath: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/?next=${encodeURIComponent(nextPath)}#account`);
  return viewer;
}

export async function requireAdminActor(): Promise<Viewer | null> {
  if (!(await isAdminRequest())) redirect("/admin/login");
  return getViewer();
}

export function safeNext(value: string | undefined | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
