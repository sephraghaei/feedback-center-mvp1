export const SEX_OPTIONS = ["زن", "مرد", "ترجیح می‌دهم نگویم"] as const;

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
    return { error: "اطلاعات پروفایل را کامل بفرست." };
  }

  const data = input as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (name.length < 2) {
    return { error: "اسمت را بنویس، حداقل دو حرف." };
  }
  if (name.length > 60) {
    return { error: "اسم بیش از حد بلند است." };
  }

  const profile: Profile = { name };

  if (data.age !== undefined && data.age !== null && data.age !== "") {
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 5 || age > 120) {
      return { error: "سن باید عددی بین ۵ تا ۱۲۰ باشد." };
    }
    profile.age = age;
  } else if ("age" in data) {
    profile.age = undefined;
  }

  if (data.sex !== undefined && data.sex !== null && data.sex !== "") {
    const sex = String(data.sex);
    if (!(SEX_OPTIONS as readonly string[]).includes(sex)) {
      return { error: "جنسیت را از گزینه‌ها انتخاب کن." };
    }
    profile.sex = sex;
  } else if ("sex" in data) {
    profile.sex = undefined;
  }

  if (data.company !== undefined && data.company !== null && data.company !== "") {
    const company = String(data.company).trim();
    if (company.length > 80) {
      return { error: "نام شرکت بیش از حد بلند است." };
    }
    profile.company = company;
  } else if ("company" in data) {
    profile.company = undefined;
  }

  if ("bio" in data) {
    const bio = typeof data.bio === "string" ? data.bio.trim() : "";
    if (bio.length > MAX_BIO_LENGTH) {
      return { error: "معرفی کوتاه حداکثر ۲۸۰ نویسه است." };
    }
    profile.bio = bio || null;
  }

  if ("avatarPath" in data) {
    if (data.avatarPath === null || data.avatarPath === "") {
      profile.avatarPath = null;
    } else if (typeof data.avatarPath === "string" && isAvatarPath(data.avatarPath)) {
      profile.avatarPath = data.avatarPath;
    } else {
      return { error: "عکس پروفایل معتبر نیست." };
    }
  }

  return { profile };
}
