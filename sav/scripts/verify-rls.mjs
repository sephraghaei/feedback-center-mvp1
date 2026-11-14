import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envFile = new URL("../.env.local", import.meta.url);
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, raw] = match;
    if (!process.env[key]) process.env[key] = raw.trim().replace(/^"(.*)"$/, "$1");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) {
  console.error("Supabase URL, anon key and service role key are required.");
  process.exit(1);
}

const options = {
  db: { schema: "sav" },
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

const admin = createClient(url, serviceKey, options);
const results = [];

function check(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`);
}

async function asGuest() {
  return createClient(url, anonKey, options);
}

async function asUser(email) {
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error) throw error;
  const client = createClient(url, anonKey, options);
  const { data: verified, error: verifyError } = await client.auth.verifyOtp({
    type: "magiclink",
    token_hash: data.properties.hashed_token,
  });
  if (verifyError) throw verifyError;
  return { client, userId: verified.user.id };
}

async function main() {
  const guest = await asGuest();

  const { data: publicAnnouncements, error: publicError } = await guest
    .from("announcements")
    .select("id, status");
  check(
    "guest can read published announcements",
    !publicError && publicAnnouncements.length === 15,
    `rows=${publicAnnouncements?.length ?? 0}`,
  );

  const { data: drafts } = await guest
    .from("announcements")
    .select("id")
    .eq("status", "draft");
  check("guest cannot see drafts", (drafts ?? []).length === 0);

  const { data: businessRows } = await guest
    .from("businesses")
    .select("id, status, slug");
  check(
    "guest sees only active businesses",
    (businessRows ?? []).every((row) => row.status === "active") &&
      (businessRows ?? []).length === 3,
    `rows=${businessRows?.length ?? 0}`,
  );

  const businessIds = Object.fromEntries((businessRows ?? []).map((row) => [row.slug, row.id]));

  const { error: profileError } = await guest.from("profiles").select("id");
  check("guest cannot read profiles", Boolean(profileError));

  const { data: searchIds, error: searchError } = await guest.rpc("search_announcements", {
    p_q: "ثبت‌نام",
    p_topic: null,
    p_business: null,
    p_from: null,
    p_to: null,
    p_importance: null,
  });
  check(
    "guest search RPC returns matches",
    !searchError && (searchIds ?? []).length >= 2,
    `rows=${searchIds?.length ?? 0}`,
  );

  const sara = await asUser("sara@sav.example");
  const reza = await asUser("reza@sav.example");
  const adminUser = await asUser("admin@sav.example");

  const { data: saraBusinessFollows } = await sara.client
    .from("business_follows")
    .select("user_id, business_id");
  check(
    "user only reads own business follows",
    (saraBusinessFollows ?? []).length > 0 &&
      (saraBusinessFollows ?? []).every((row) => row.user_id === sara.userId),
    `rows=${saraBusinessFollows?.length ?? 0}`,
  );

  const { data: rezaNotifications } = await sara.client
    .from("notifications")
    .select("id, user_id")
    .eq("user_id", reza.userId);
  check("user cannot read another user notifications", (rezaNotifications ?? []).length === 0);

  const { data: saraSaved } = await sara.client.from("saved_announcements").select("user_id");
  check(
    "user only reads own saved rows",
    (saraSaved ?? []).every((row) => row.user_id === sara.userId),
    `rows=${saraSaved?.length ?? 0}`,
  );

  const { data: saraPrefs } = await sara.client
    .from("notification_preferences")
    .select("user_id");
  check(
    "user only reads own preferences",
    (saraPrefs ?? []).length === 1 && saraPrefs?.[0]?.user_id === sara.userId,
    `rows=${saraPrefs?.length ?? 0}`,
  );

  const { data: tuskaUpdate } = await sara.client
    .from("businesses")
    .update({ description: "blocked" })
    .eq("id", businessIds["tuska-store"])
    .select("id");
  check("non-member cannot edit a business", (tuskaUpdate ?? []).length === 0);

  const { error: urgentError } = await reza.client.from("announcements").insert({
    business_id: businessIds["tuska-store"],
    created_by: reza.userId,
    title: "اعلان فوری آزمایشی",
    body: "این رکورد نباید ذخیره شود چون کسب‌وکار اجازه اعلان فوری ندارد.",
    importance: "urgent",
    status: "published",
    published_at: new Date().toISOString(),
  });
  check(
    "database rejects urgent publish without urgent_allowed",
    Boolean(urgentError && urgentError.message.includes("urgent_not_allowed")),
    urgentError?.message ?? "insert unexpectedly succeeded",
  );

  const { data: adminProfiles, error: adminProfileError } = await adminUser.client
    .from("profiles")
    .select("id");
  check(
    "admin can read all profiles",
    !adminProfileError && (adminProfiles ?? []).length >= 4,
    `rows=${adminProfiles?.length ?? 0}`,
  );

  const { data: adminNotifications } = await adminUser.client
    .from("notifications")
    .select("id")
    .eq("user_id", reza.userId);
  check(
    "fan-out created notifications for followers",
    (adminNotifications ?? []).length > 0,
    `reza rows=${adminNotifications?.length ?? 0}`,
  );

  const failed = results.filter((result) => !result.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error("Verification failed:", error.message ?? error);
  process.exit(1);
});
