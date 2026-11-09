import { and, asc, count, desc, eq, gte, ilike, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "./db";
import { profiles, users } from "./db/schema";
import { normalizePhone } from "./phone";
import { SEX_OPTIONS, validateProfile } from "./profile";

export type UserMethod = "phone" | "email" | "clerk" | "unknown";

export type AdminUserRow = {
  id: string;
  phone: string | null;
  email: string | null;
  clerkId: string | null;
  createdAt: string;
  name: string | null;
  age: number | null;
  sex: string | null;
  company: string | null;
  method: UserMethod;
  hasProfile: boolean;
};

export type UserSnapshot = {
  id: string;
  phone: string | null;
  email: string | null;
  clerkId: string | null;
  createdAt: string;
  name: string | null;
  age: number | null;
  sex: string | null;
  company: string | null;
};

export type ListParams = {
  search?: string;
  method?: string;
  profile?: string;
  sort?: string;
  dir?: string;
  page?: number;
  pageSize?: number;
};

function methodOf(row: { phone: string | null; email: string | null; clerkId: string | null }): UserMethod {
  if (row.clerkId) return "clerk";
  if (row.phone) return "phone";
  if (row.email) return "email";
  return "unknown";
}

const selected = {
  id: users.id,
  phone: users.phone,
  email: users.email,
  clerkId: users.clerkId,
  createdAt: users.createdAt,
  name: profiles.name,
  age: profiles.age,
  sex: profiles.sex,
  company: profiles.company,
};

function toRow(row: {
  id: string;
  phone: string | null;
  email: string | null;
  clerkId: string | null;
  createdAt: Date;
  name: string | null;
  age: number | null;
  sex: string | null;
  company: string | null;
}): AdminUserRow {
  return {
    id: row.id,
    phone: row.phone,
    email: row.email,
    clerkId: row.clerkId,
    createdAt: row.createdAt.toISOString(),
    name: row.name,
    age: row.age,
    sex: row.sex,
    company: row.company,
    method: methodOf(row),
    hasProfile: row.name !== null,
  };
}

function buildConditions(params: ListParams): SQL[] {
  const conditions: SQL[] = [];
  const search = params.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(ilike(profiles.name, pattern), ilike(users.email, pattern), ilike(users.phone, pattern))!,
    );
  }
  if (params.method === "phone") conditions.push(isNotNull(users.phone));
  if (params.method === "email") conditions.push(and(isNotNull(users.email), isNull(users.clerkId))!);
  if (params.method === "clerk") conditions.push(isNotNull(users.clerkId));
  if (params.profile === "complete") conditions.push(isNotNull(profiles.userId));
  if (params.profile === "incomplete") conditions.push(isNull(profiles.userId));
  return conditions;
}

export async function listUsers(params: ListParams) {
  const db = getDb();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, params.pageSize ?? 10));
  const conditions = buildConditions(params);
  const where = conditions.length ? and(...conditions) : undefined;

  const orderColumn =
    params.sort === "name" ? profiles.name : params.sort === "email" ? users.email : users.createdAt;
  const order = params.dir === "asc" ? asc(orderColumn) : desc(orderColumn);

  const [rows, totals] = await Promise.all([
    db
      .select(selected)
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: count() })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(where),
  ]);

  const total = totals[0]?.total ?? 0;
  return {
    rows: rows.map(toRow),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getUserById(id: string): Promise<AdminUserRow | null> {
  const [row] = await getDb()
    .select(selected)
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, id))
    .limit(1);
  return row ? toRow(row) : null;
}

export type AdminStats = {
  totalUsers: number;
  withProfile: number;
  withoutProfile: number;
  phoneUsers: number;
  emailUsers: number;
  clerkUsers: number;
  newLast7: number;
  newLast30: number;
  averageAge: number | null;
  daily: { date: string; count: number }[];
  methods: { method: UserMethod; count: number }[];
  sexes: { sex: string; count: number }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const db = getDb();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const start30 = new Date(now - 29 * day);

  const [
    totalRows,
    profileRows,
    phoneRows,
    emailRows,
    clerkRows,
    new7Rows,
    new30Rows,
    ageRows,
    dailyRows,
    sexRows,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(profiles),
    db.select({ value: count() }).from(users).where(isNotNull(users.phone)),
    db.select({ value: count() }).from(users).where(and(isNotNull(users.email), isNull(users.clerkId))),
    db.select({ value: count() }).from(users).where(isNotNull(users.clerkId)),
    db.select({ value: count() }).from(users).where(gte(users.createdAt, new Date(now - 7 * day))),
    db.select({ value: count() }).from(users).where(gte(users.createdAt, new Date(now - 30 * day))),
    db.select({ value: sql<string | null>`avg(${profiles.age})` }).from(profiles),
    db
      .select({
        date: sql<string>`to_char(${users.createdAt}, 'YYYY-MM-DD')`,
        value: count(),
      })
      .from(users)
      .where(gte(users.createdAt, start30))
      .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`),
    db
      .select({ sex: profiles.sex, value: count() })
      .from(profiles)
      .where(isNotNull(profiles.sex))
      .groupBy(profiles.sex),
  ]);

  const byDate = new Map(dailyRows.map((row) => [row.date, row.value]));
  const daily: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * day).toISOString().slice(0, 10);
    daily.push({ date, count: byDate.get(date) ?? 0 });
  }

  const totalUsers = totalRows[0]?.value ?? 0;
  const withProfile = profileRows[0]?.value ?? 0;
  const phoneUsers = phoneRows[0]?.value ?? 0;
  const emailUsers = emailRows[0]?.value ?? 0;
  const clerkUsers = clerkRows[0]?.value ?? 0;
  const avgRaw = ageRows[0]?.value;

  return {
    totalUsers,
    withProfile,
    withoutProfile: totalUsers - withProfile,
    phoneUsers,
    emailUsers,
    clerkUsers,
    newLast7: new7Rows[0]?.value ?? 0,
    newLast30: new30Rows[0]?.value ?? 0,
    averageAge: avgRaw === null || avgRaw === undefined ? null : Math.round(Number(avgRaw)),
    daily,
    methods: [
      { method: "phone", count: phoneUsers },
      { method: "email", count: emailUsers },
      { method: "clerk", count: clerkUsers },
    ],
    sexes: sexRows
      .filter((row): row is { sex: string; value: number } => row.sex !== null)
      .map((row) => ({ sex: row.sex, count: row.value })),
  };
}

export type UserInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  age?: unknown;
  sex?: unknown;
  company?: unknown;
};

type ParsedInput = {
  ok: true;
  name: string;
  email: string | null;
  phone: string | null;
  profile: { name: string; age?: number; sex?: string; company?: string };
} | { ok: false; error: string };

function parseInput(input: UserInput, requireIdentifier: boolean): ParsedInput {
  const validated = validateProfile(input);
  if ("error" in validated) return { ok: false, error: validated.error };

  let email: string | null = null;
  if (input.email !== undefined && input.email !== null && String(input.email).trim() !== "") {
    const value = String(input.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { ok: false, error: "ایمیل معتبر نیست." };
    email = value;
  }

  let phone: string | null = null;
  if (input.phone !== undefined && input.phone !== null && String(input.phone).trim() !== "") {
    phone = normalizePhone(input.phone);
    if (!phone) return { ok: false, error: "شماره موبایل معتبر نیست." };
  }

  if (requireIdentifier && !email && !phone) {
    return { ok: false, error: "حداقل یک ایمیل یا شماره موبایل لازم است." };
  }

  return { ok: true, name: validated.profile.name, email, phone, profile: validated.profile };
}

async function identifierTaken(email: string | null, phone: string | null, exceptId?: string) {
  const db = getDb();
  if (email) {
    const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (row && row.id !== exceptId) return "این ایمیل قبلا ثبت شده است.";
  }
  if (phone) {
    const [row] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
    if (row && row.id !== exceptId) return "این شماره موبایل قبلا ثبت شده است.";
  }
  return null;
}

export async function createUser(input: UserInput): Promise<{ row: AdminUserRow } | { error: string }> {
  const parsed = parseInput(input, true);
  if (!parsed.ok) return { error: parsed.error };

  const taken = await identifierTaken(parsed.email, parsed.phone);
  if (taken) return { error: taken };

  const db = getDb();
  const [user] = await db
    .insert(users)
    .values({ email: parsed.email, phone: parsed.phone })
    .returning({ id: users.id });

  await db.insert(profiles).values({
    userId: user.id,
    name: parsed.profile.name,
    age: parsed.profile.age ?? null,
    sex: parsed.profile.sex ?? null,
    company: parsed.profile.company ?? null,
  });

  const row = await getUserById(user.id);
  return row ? { row } : { error: "ساخت کاربر انجام نشد." };
}

export async function updateUser(
  id: string,
  input: UserInput,
): Promise<{ row: AdminUserRow } | { error: string }> {
  const existing = await getUserById(id);
  if (!existing) return { error: "کاربر پیدا نشد." };

  const parsed = parseInput(input, false);
  if (!parsed.ok) return { error: parsed.error };

  const email = parsed.email;
  const phone = parsed.phone;
  if (!email && !phone && !existing.clerkId) {
    return { error: "حداقل یک ایمیل یا شماره موبایل لازم است." };
  }

  const taken = await identifierTaken(email, phone, id);
  if (taken) return { error: taken };

  const db = getDb();
  await db
    .update(users)
    .set({ email, phone, updatedAt: new Date() })
    .where(eq(users.id, id));

  await db
    .insert(profiles)
    .values({
      userId: id,
      name: parsed.profile.name,
      age: parsed.profile.age ?? null,
      sex: parsed.profile.sex ?? null,
      company: parsed.profile.company ?? null,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        name: parsed.profile.name,
        age: parsed.profile.age ?? null,
        sex: parsed.profile.sex ?? null,
        company: parsed.profile.company ?? null,
        updatedAt: new Date(),
      },
    });

  const row = await getUserById(id);
  return row ? { row } : { error: "ویرایش کاربر انجام نشد." };
}

export async function deleteUser(id: string): Promise<{ snapshot: UserSnapshot } | { error: string }> {
  const existing = await getUserById(id);
  if (!existing) return { error: "کاربر پیدا نشد." };

  const snapshot: UserSnapshot = {
    id: existing.id,
    phone: existing.phone,
    email: existing.email,
    clerkId: existing.clerkId,
    createdAt: existing.createdAt,
    name: existing.name,
    age: existing.age,
    sex: existing.sex,
    company: existing.company,
  };

  await getDb().delete(users).where(eq(users.id, id));
  return { snapshot };
}

export async function restoreUser(snapshot: UserSnapshot): Promise<{ row: AdminUserRow } | { error: string }> {
  const db = getDb();
  await db
    .insert(users)
    .values({
      id: snapshot.id,
      phone: snapshot.phone,
      email: snapshot.email,
      clerkId: snapshot.clerkId,
      createdAt: new Date(snapshot.createdAt),
    })
    .onConflictDoNothing();

  if (snapshot.name) {
    await db
      .insert(profiles)
      .values({
        userId: snapshot.id,
        name: snapshot.name,
        age: snapshot.age,
        sex: snapshot.sex,
        company: snapshot.company,
      })
      .onConflictDoNothing();
  }

  const row = await getUserById(snapshot.id);
  return row ? { row } : { error: "بازگردانی کاربر انجام نشد." };
}

export { SEX_OPTIONS };