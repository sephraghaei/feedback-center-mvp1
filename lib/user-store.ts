import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { profiles, users, type ProfileRow } from "./db/schema";
import type { Profile } from "./profile";

export type UserWithProfile = {
  userId: string;
  phone: string;
  profile: Profile | null;
};

function rowToProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    ...(row.age !== null ? { age: row.age } : {}),
    ...(row.sex !== null ? { sex: row.sex } : {}),
    ...(row.company !== null ? { company: row.company } : {}),
  };
}

export async function ensureUser(phone: string): Promise<string> {
  const db = getDb();
  await db.insert(users).values({ phone }).onConflictDoNothing({ target: users.phone });
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
  if (!user) {
    throw new Error("Could not create or find the user");
  }
  return user.id;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const [row] = await getDb().select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return row ? rowToProfile(row) : null;
}

export async function saveProfile(userId: string, profile: Profile): Promise<void> {
  const values = {
    userId,
    name: profile.name,
    age: profile.age ?? null,
    sex: profile.sex ?? null,
    company: profile.company ?? null,
  };

  await getDb()
    .insert(profiles)
    .values(values)
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        name: values.name,
        age: values.age,
        sex: values.sex,
        company: values.company,
        updatedAt: new Date(),
      },
    });
}

/**
 * Resolves the database user behind a session. Sessions created before the
 * database existed carry the profile inside the signed cookie, so that profile
 * is written on first use. This is the lazy migration for current users.
 */
export async function loadUserWithProfile(phone: string, legacyProfile?: Profile): Promise<UserWithProfile> {
  const userId = await ensureUser(phone);
  let profile = await getProfile(userId);

  if (!profile && legacyProfile) {
    await saveProfile(userId, legacyProfile);
    profile = legacyProfile;
  }

  return { userId, phone, profile };
}
