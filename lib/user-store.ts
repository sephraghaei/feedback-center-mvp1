import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "./db";
import { profiles, users, type ProfileRow } from "./db/schema";
import type { Profile } from "./profile";

export type UserWithProfile = {
  userId: string;
  phone: string | null;
  email: string | null;
  profile: Profile | null;
};

function rowToProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    ...(row.age !== null ? { age: row.age } : {}),
    ...(row.sex !== null ? { sex: row.sex } : {}),
    ...(row.company !== null ? { company: row.company } : {}),
    bio: row.bio,
    avatarPath: row.avatarPath,
  };
}

export async function ensureUserByPhone(phone: string): Promise<string> {
  const db = getDb();
  await db.insert(users).values({ phone }).onConflictDoNothing({ target: users.phone });
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
  if (!user) {
    throw new Error("Could not create or find the user");
  }
  return user.id;
}

export async function ensureUserByEmail(email: string): Promise<string> {
  const db = getDb();
  await db.insert(users).values({ email }).onConflictDoNothing({ target: users.email });
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    throw new Error("Could not create or find the user");
  }
  return user.id;
}

/**
 * Links a Clerk user to a row in `users`. `resolveEmail` is only called when the
 * row is new or has never had an email (an admin-cleared email stays cleared), so teammates can be invited by email and
 * older email accounts are reused instead of duplicated.
 */
export async function ensureUserByClerkId(
  clerkId: string,
  resolveEmail?: () => Promise<string | null | undefined>,
): Promise<string> {
  const db = getDb();
  const readEmail = async () => (await resolveEmail?.())?.trim().toLowerCase() || null;

  const [linked] = await db
    .select({ id: users.id, email: users.email, createdAt: users.createdAt, updatedAt: users.updatedAt })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (linked) {
    const neverEdited = linked.updatedAt.getTime() === linked.createdAt.getTime();
    if (!linked.email && neverEdited && resolveEmail) {
      const email = await readEmail();
      if (email) {
        await db
          .update(users)
          .set({ email, updatedAt: new Date() })
          .where(
            and(
              eq(users.id, linked.id),
              isNull(users.email),
              eq(users.updatedAt, users.createdAt),
              sql`not exists (select 1 from ${users} as taken where taken.email = ${email})`,
            ),
          );
      }
    }
    return linked.id;
  }

  const email = await readEmail();
  if (email) {
    const [existing] = await db
      .select({ id: users.id, clerkId: users.clerkId })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing && !existing.clerkId) {
      const [claimed] = await db
        .update(users)
        .set({ clerkId, updatedAt: new Date() })
        .where(and(eq(users.id, existing.id), isNull(users.clerkId)))
        .returning({ id: users.id });
      if (claimed) return claimed.id;
    }
    if (existing) {
      await db.insert(users).values({ clerkId }).onConflictDoNothing({ target: users.clerkId });
      const [user] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!user) throw new Error("Could not create or find the user");
      return user.id;
    }
  }
  await db.insert(users).values({ clerkId, email: email ?? null }).onConflictDoNothing({ target: users.clerkId });
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (!user) {
    throw new Error("Could not create or find the user");
  }
  return user.id;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const [row] = await getDb().select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return row ? rowToProfile(row) : null;
}

export async function saveProfile(
  userId: string,
  profile: Partial<Profile> & { name: string },
): Promise<void> {
  const values: typeof profiles.$inferInsert = { userId, name: profile.name };
  const set: Partial<typeof profiles.$inferInsert> = {
    name: profile.name,
    updatedAt: new Date(),
  };

  if ("age" in profile) {
    values.age = profile.age ?? null;
    set.age = values.age;
  }
  if ("sex" in profile) {
    values.sex = profile.sex ?? null;
    set.sex = values.sex;
  }
  if ("company" in profile) {
    values.company = profile.company ?? null;
    set.company = values.company;
  }
  if ("bio" in profile) {
    values.bio = profile.bio ?? null;
    set.bio = values.bio;
  }
  if ("avatarPath" in profile) {
    values.avatarPath = profile.avatarPath ?? null;
    set.avatarPath = values.avatarPath;
  }

  await getDb()
    .insert(profiles)
    .values(values)
    .onConflictDoUpdate({ target: profiles.userId, set });
}

/**
 * Resolves the database user behind a session. Sessions created before the
 * database existed carry the profile inside the signed cookie, so that profile
 * is written on first use. This is the lazy migration for current users.
 */
export async function loadUserWithProfile(
  identifier: { phone?: string; email?: string },
  legacyProfile?: Profile,
): Promise<UserWithProfile> {
  const phone = identifier.phone ?? null;
  const email = identifier.email ?? null;
  const userId = phone ? await ensureUserByPhone(phone) : await ensureUserByEmail(email ?? "");
  let profile = await getProfile(userId);

  if (!profile && legacyProfile) {
    await saveProfile(userId, legacyProfile);
    profile = legacyProfile;
  }

  return { userId, phone, email, profile };
}
