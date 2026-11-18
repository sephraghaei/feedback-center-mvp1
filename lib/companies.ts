import { and, asc, eq, sql } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "./db";
import {
  companies,
  companyMembers,
  posts,
  profiles,
  upvotes,
  users,
  type CompanyRow,
} from "./db/schema";
import { PostError } from "./feedback/posts";

export type CompanyRole = "owner" | "admin" | "member";

export type CompanyMembership = { company: CompanyRow; role: CompanyRole };

function asRole(value: string): CompanyRole {
  if (value === "owner" || value === "admin") return value;
  return "member";
}

export const getCompanyBySlug = cache(async (slug: string): Promise<CompanyRow | null> => {
  const [row] = await getDb()
    .select()
    .from(companies)
    .where(eq(companies.slug, slug))
    .limit(1);
  return row ?? null;
});

export const getCompanyById = cache(async (id: string): Promise<CompanyRow | null> => {
  const [row] = await getDb().select().from(companies).where(eq(companies.id, id)).limit(1);
  return row ?? null;
});

export async function getDefaultCompany(): Promise<CompanyRow | null> {
  const preferred = process.env.DEFAULT_COMPANY_SLUG?.trim();
  if (preferred) {
    const match = await getCompanyBySlug(preferred);
    if (match) return match;
  }
  const [row] = await getDb()
    .select()
    .from(companies)
    .orderBy(asc(companies.createdAt))
    .limit(1);
  return row ?? null;
}

export async function listCompanies(): Promise<CompanyRow[]> {
  return getDb().select().from(companies).orderBy(asc(companies.name));
}

export const listUserCompanies = cache(async (userId: string): Promise<CompanyMembership[]> => {
  const rows = await getDb()
    .select({ company: companies, role: companyMembers.role })
    .from(companyMembers)
    .innerJoin(companies, eq(companies.id, companyMembers.companyId))
    .where(eq(companyMembers.userId, userId))
    .orderBy(asc(companyMembers.createdAt));

  return rows.map((row) => ({ company: row.company, role: asRole(row.role) }));
});

export async function getMembership(
  companyId: string,
  userId: string,
): Promise<CompanyRole | null> {
  const [row] = await getDb()
    .select({ role: companyMembers.role })
    .from(companyMembers)
    .where(and(eq(companyMembers.companyId, companyId), eq(companyMembers.userId, userId)))
    .limit(1);
  return row ? asRole(row.role) : null;
}

export async function canManageCompany(
  companyId: string,
  userId: string,
  platformAdmin = false,
): Promise<boolean> {
  if (platformAdmin) return true;
  const role = await getMembership(companyId, userId);
  return role === "owner" || role === "admin";
}

export type CompanyMember = {
  userId: string;
  name: string | null;
  email: string | null;
  avatarPath: string | null;
  role: CompanyRole;
  joinedAt: Date;
};

export async function listCompanyMembers(companyId: string): Promise<CompanyMember[]> {
  const rows = await getDb()
    .select({
      userId: users.id,
      name: profiles.name,
      email: users.email,
      avatarPath: profiles.avatarPath,
      role: companyMembers.role,
      joinedAt: companyMembers.createdAt,
    })
    .from(companyMembers)
    .innerJoin(users, eq(users.id, companyMembers.userId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(companyMembers.companyId, companyId))
    .orderBy(asc(companyMembers.createdAt));

  return rows.map((row) => ({ ...row, role: asRole(row.role) }));
}

export type CompanyStats = {
  total: number;
  fresh: number;
  planned: number;
  inProgress: number;
  shipped: number;
  votes: number;
};

export async function getCompanyStats(companyId: string): Promise<CompanyStats> {
  const [row] = await getDb()
    .select({
      total: sql<number>`count(*)::int`,
      fresh: sql<number>`count(*) filter (where ${posts.status} = 'new')::int`,
      planned: sql<number>`count(*) filter (where ${posts.status} = 'planned')::int`,
      inProgress: sql<number>`count(*) filter (where ${posts.status} = 'in_progress')::int`,
      shipped: sql<number>`count(*) filter (where ${posts.status} = 'shipped')::int`,
    })
    .from(posts)
    .where(
      and(
        eq(posts.companyId, companyId),
        eq(posts.type, "feedback"),
        eq(posts.hidden, false),
      ),
    );

  const [votes] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(upvotes)
    .innerJoin(posts, eq(posts.id, upvotes.postId))
    .where(and(eq(posts.companyId, companyId), eq(posts.type, "feedback")));

  return {
    total: row?.total ?? 0,
    fresh: row?.fresh ?? 0,
    planned: row?.planned ?? 0,
    inProgress: row?.inProgress ?? 0,
    shipped: row?.shipped ?? 0,
    votes: votes?.n ?? 0,
  };
}

export async function addCompanyMember(companyId: string, email: string): Promise<void> {
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@")) throw new PostError("Enter a valid email address.");

  const [user] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, clean))
    .limit(1);

  if (!user) {
    throw new PostError("No account uses that email yet. Ask them to sign up first.");
  }

  await getDb()
    .insert(companyMembers)
    .values({ companyId, userId: user.id, role: "member" })
    .onConflictDoNothing();
}

export async function updateCompany(
  companyId: string,
  input: { name: string; tagline: string; website: string; accent: string },
): Promise<void> {
  const name = input.name.trim();
  if (name.length < 2) throw new PostError("Company name must be at least 2 characters.");
  if (name.length > 80) throw new PostError("Company name must be 80 characters or fewer.");

  const tagline = input.tagline.trim();
  if (tagline.length > 160) throw new PostError("Tagline must be 160 characters or fewer.");

  const website = input.website.trim();
  if (website && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(website)) {
    throw new PostError("Website must start with http:// or https://.");
  }

  const accent = input.accent.trim();
  if (!/^#[0-9a-f]{6}$/i.test(accent)) throw new PostError("Accent must be a hex color like #2563eb.");

  await getDb()
    .update(companies)
    .set({
      name,
      tagline: tagline || null,
      website: website || null,
      accent,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId));
}
