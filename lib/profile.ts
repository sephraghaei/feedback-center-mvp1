export const SEX_OPTIONS = ["زن", "مرد", "ترجیح می‌دهم نگویم"] as const;

export type Profile = {
  name: string;
  age?: number;
  sex?: string;
  company?: string;
};

export type Session = {
  phone: string;
  method: "phone";
  createdAt: number;
  expiresAt: number;
  profile?: Profile;
};

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
  }

  if (data.sex !== undefined && data.sex !== null && data.sex !== "") {
    const sex = String(data.sex);
    if (!(SEX_OPTIONS as readonly string[]).includes(sex)) {
      return { error: "جنسیت را از گزینه‌ها انتخاب کن." };
    }
    profile.sex = sex;
  }

  if (data.company !== undefined && data.company !== null && data.company !== "") {
    const company = String(data.company).trim();
    if (company.length > 80) {
      return { error: "نام شرکت بیش از حد بلند است." };
    }
    profile.company = company;
  }

  return { profile };
}
