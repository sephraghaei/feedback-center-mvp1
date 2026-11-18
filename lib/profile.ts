import type { Locale } from "@/lib/i18n/locale";

export const SEX_OPTIONS = ["Female", "Male", "Prefer not to say"] as const;

const SEX_LABELS_FA: Record<string, string> = {
  Female: "زن",
  Male: "مرد",
  "Prefer not to say": "ترجیح می‌دهم نگویم",
  زن: "زن",
  مرد: "مرد",
  "ترجیح می‌دهم نگویم": "ترجیح می‌دهم نگویم",
};

const LEGACY_SEX_OPTIONS = ["زن", "مرد", "ترجیح می‌دهم نگویم"];

export function sexLabel(value: string, locale: Locale): string {
  if (locale !== "fa") return value;
  return SEX_LABELS_FA[value] ?? value;
}

export const MAX_BIO_LENGTH = 280;

export type Profile = {
  name: string;
  age?: number;
  sex?: string;
  company?: string;
  bio?: string | null;
  avatarPath?: string | null;
};

export type Session = {
  userId?: string;
  phone?: string;
  email?: string;
  method: "phone" | "email";
  createdAt: number;
  expiresAt: number;
  /** Only present on sessions issued before the database existed. */
  profile?: Profile;
};

const AVATAR_PATH =
  /^avatars\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:png|jpe?g|webp|gif)$/i;

export function isAvatarPath(value: string): boolean {
  return AVATAR_PATH.test(value);
}

export function validateProfile(input: unknown): { profile: Profile } | { error: string } {
  if (typeof input !== "object" || input === null) {
    return { error: "Send the profile fields." };
  }

  const data = input as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (name.length < 2) {
    return { error: "Enter your name, at least two characters." };
  }
  if (name.length > 60) {
    return { error: "That name is too long." };
  }

  const profile: Profile = { name };

  if (data.age !== undefined && data.age !== null && data.age !== "") {
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 5 || age > 120) {
      return { error: "Age must be a number between 5 and 120." };
    }
    profile.age = age;
  } else if ("age" in data) {
    profile.age = undefined;
  }

  if (data.sex !== undefined && data.sex !== null && data.sex !== "") {
    const sex = String(data.sex);
    if (![...SEX_OPTIONS, ...LEGACY_SEX_OPTIONS].includes(sex)) {
      return { error: "Pick one of the gender options." };
    }
    profile.sex = sex;
  } else if ("sex" in data) {
    profile.sex = undefined;
  }

  if (data.company !== undefined && data.company !== null && data.company !== "") {
    const company = String(data.company).trim();
    if (company.length > 80) {
      return { error: "That company name is too long." };
    }
    profile.company = company;
  } else if ("company" in data) {
    profile.company = undefined;
  }

  if ("bio" in data) {
    const bio = typeof data.bio === "string" ? data.bio.trim() : "";
    if (bio.length > MAX_BIO_LENGTH) {
      return { error: "The bio can be up to 280 characters." };
    }
    profile.bio = bio || null;
  }

  if ("avatarPath" in data) {
    if (data.avatarPath === null || data.avatarPath === "") {
      profile.avatarPath = null;
    } else if (typeof data.avatarPath === "string" && isAvatarPath(data.avatarPath)) {
      profile.avatarPath = data.avatarPath;
    } else {
      return { error: "That profile photo is not valid." };
    }
  }

  return { profile };
}
