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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  db: { schema: "sav" },
  auth: { autoRefreshToken: false, persistSession: false },
});

const PEOPLE = [
  { email: "admin@sav.example", display_name: "مدیر ساو", role: "platform_admin" },
  { email: "sara@sav.example", display_name: "سارا محمدی", role: "user" },
  { email: "reza@sav.example", display_name: "رضا کریمی", role: "user" },
  { email: "mina@sav.example", display_name: "مینا رستمی", role: "user" },
];

const BUSINESSES = [
  {
    slug: "narenj-academy",
    name: "آکادمی نارنج",
    description:
      "آکادمی نارنج دوره‌های برنامه‌نویسی، طراحی و مهارت‌های دیجیتال را برای نوجوانان و بزرگسالان برگزار می‌کند.",
    logo_url: null,
    contact_email: "hello@narenj.example",
    website_url: "https://narenj.example",
    primary_topic: "education",
    urgent_allowed: true,
    owner: "sara@sav.example",
  },
  {
    slug: "tuska-store",
    name: "فروشگاه توسکا",
    description:
      "توسکا فروشگاه آنلاین لوازم خانگی و محصولات روزمره با ارسال سراسری است.",
    logo_url: null,
    contact_email: "support@tuska.example",
    website_url: "https://tuska.example",
    primary_topic: "economy",
    urgent_allowed: false,
    owner: "reza@sav.example",
  },
  {
    slug: "mehr-clinic",
    name: "کلینیک مهر",
    description:
      "کلینیک مهر خدمات درمانی و مراقبت‌های اولیه را در شرق تهران ارائه می‌دهد.",
    logo_url: null,
    contact_email: "info@mehr.example",
    website_url: "https://mehr.example",
    primary_topic: "public-services",
    urgent_allowed: true,
    owner: "mina@sav.example",
  },
];

const ANNOUNCEMENTS = [
  {
    business: "narenj-academy",
    title: "ثبت‌نام دوره پاییزه برنامه‌نویسی آغاز شد",
    body: "دوره پاییزه برنامه‌نویسی نارنج برای دو سطح مقدماتی و پیشرفته برگزار می‌شود.\nظرفیت هر کلاس محدود است و اولویت با ثبت‌نام زودتر خواهد بود.",
    importance: "important",
    topics: ["education", "technology"],
    daysAgo: 1,
  },
  {
    business: "narenj-academy",
    title: "کارگاه رایگان طراحی رابط کاربری",
    body: "یک کارگاه دو ساعته درباره اصول طراحی رابط کاربری برگزار می‌کنیم. شرکت برای همه آزاد و رایگان است.",
    importance: "normal",
    topics: ["education", "technology"],
    daysAgo: 2,
  },
  {
    business: "narenj-academy",
    title: "تمدید مهلت ثبت‌نام تا پایان هفته",
    body: "به درخواست شما مهلت ثبت‌نام دوره پاییزه تا پایان همین هفته تمدید شد. ظرفیت‌های باقی‌مانده محدود است.",
    importance: "important",
    topics: ["education"],
    daysAgo: 3,
  },
  {
    business: "narenj-academy",
    title: "بورس تحصیلی نارنج برای دانش‌آموزان",
    body: "برای دانش‌آموزان مستعد، تعدادی بورس کامل دوره در نظر گرفته‌ایم. برای دریافت فرم درخواست به سایت مراجعه کنید.",
    importance: "normal",
    topics: ["education"],
    daysAgo: 5,
  },
  {
    business: "narenj-academy",
    title: "قطعی موقت سامانه کلاس آنلاین",
    body: "سامانه کلاس آنلاین امشب از ساعت ۲۳ تا ۱ بامداد برای به‌روزرسانی در دسترس نیست. کلاس‌های فردا طبق برنامه برگزار می‌شود.",
    importance: "urgent",
    topics: ["technology", "education"],
    daysAgo: 0,
  },
  {
    business: "narenj-academy",
    title: "مسیر جدید داده و هوش مصنوعی",
    body: "از ترم آینده مسیر یادگیری داده و هوش مصنوعی به دوره‌های نارنج اضافه می‌شود. جزئیات پیش‌نیازها در سایت منتشر شده است.",
    importance: "normal",
    topics: ["technology", "education"],
    daysAgo: 7,
  },
  {
    business: "tuska-store",
    title: "جشنواره تخفیف پایان فصل",
    body: "تا پایان هفته روی بخش وسیعی از محصولات تخفیف پایان فصل اعمال می‌شود. موجودی محدود است.",
    importance: "important",
    topics: ["economy", "business"],
    daysAgo: 1,
  },
  {
    business: "tuska-store",
    title: "ارسال رایگان برای سفارش‌های بالای یک میلیون",
    body: "سفارش‌های بالای یک میلیون تومان تا پایان ماه ارسال رایگان دارند. این طرح برای همه شهرها فعال است.",
    importance: "normal",
    topics: ["business"],
    daysAgo: 2,
  },
  {
    business: "tuska-store",
    title: "محصولات تازه در بخش لوازم خانگی",
    body: "مجموعه جدیدی از لوازم خانگی به فروشگاه اضافه شد. برای دیدن محصولات به صفحه فروشگاه سر بزنید.",
    importance: "normal",
    topics: ["economy"],
    daysAgo: 4,
  },
  {
    business: "tuska-store",
    title: "تغییر ساعات کاری فروشگاه",
    body: "از هفته آینده ساعات کاری فروشگاه حضوری از ۹ تا ۱۸ خواهد بود. سفارش‌های آنلاین بدون تغییر ادامه دارد.",
    importance: "normal",
    topics: ["business"],
    daysAgo: 6,
  },
  {
    business: "tuska-store",
    title: "همکاری با برندهای ایرانی",
    body: "توسکا همکاری با چند برند ایرانی را آغاز کرده است. محصولات تازه به تدریج در سایت منتشر می‌شوند.",
    importance: "normal",
    topics: ["business", "economy"],
    daysAgo: 9,
  },
  {
    business: "mehr-clinic",
    title: "برنامه واکسیناسیون آنفلوانزا آغاز شد",
    body: "برنامه واکسیناسیون فصلی از این هفته در کلینیک مهر آغاز شده است. برای رزرو نوبت با پذیرش تماس بگیرید.",
    importance: "important",
    topics: ["public-services"],
    daysAgo: 1,
  },
  {
    business: "mehr-clinic",
    title: "افزایش ساعات پذیرش در روزهای تعطیل",
    body: "پذیرش کلینیک در روزهای تعطیل تا ساعت ۲۰ ادامه دارد. بخش اورژانس طبق روال شبانه‌روزی فعال است.",
    importance: "normal",
    topics: ["public-services"],
    daysAgo: 3,
  },
  {
    business: "mehr-clinic",
    title: "تعطیلی موقت بخش اورژانس",
    body: "بخش اورژانس امروز برای جابه‌جایی تجهیزات تا ساعت ۱۸ تعطیل است. در موارد اضطراری با اورژانس تماس بگیرید.",
    importance: "urgent",
    topics: ["public-services"],
    daysAgo: 0,
  },
  {
    business: "mehr-clinic",
    title: "ورکشاپ سلامت خانواده",
    body: "ورکشاپ سلامت خانواده با حضور پزشکان کلینیک برگزار می‌شود. ثبت‌نام از طریق سایت کلینیک انجام می‌شود.",
    importance: "normal",
    topics: ["public-services", "education"],
    daysAgo: 8,
  },
];

const PREFERENCES = {
  "sara@sav.example": {
    normal_channels: ["in_app"],
    important_channels: ["in_app", "email"],
    urgent_channels: ["in_app", "email"],
  },
  "reza@sav.example": {
    normal_channels: ["in_app"],
    important_channels: ["in_app"],
    urgent_channels: ["in_app", "email"],
  },
  "mina@sav.example": {
    normal_channels: ["in_app"],
    important_channels: ["in_app"],
    urgent_channels: ["in_app", "email"],
  },
};

const FOLLOWS = [
  { email: "sara@sav.example", business: "narenj-academy", topic: "technology" },
  { email: "reza@sav.example", business: "tuska-store", topic: "economy" },
  { email: "mina@sav.example", business: "mehr-clinic", topic: "public-services" },
  { email: "mina@sav.example", business: "narenj-academy", topic: null },
];

function isoDaysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

async function ensureUsers() {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;

  const byEmail = new Map(data.users.map((user) => [user.email, user.id]));
  const ids = new Map();

  for (const person of PEOPLE) {
    let id = byEmail.get(person.email);
    if (!id) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: person.email,
        email_confirm: true,
        user_metadata: { display_name: person.display_name },
      });
      if (createError) throw createError;
      id = created.user.id;
    }
    ids.set(person.email, id);

    await admin
      .from("profiles")
      .upsert({ id, display_name: person.display_name, role: person.role }, { onConflict: "id" });
  }

  return ids;
}

async function main() {
  const userIds = await ensureUsers();

  const { data: topicRows, error: topicError } = await admin
    .from("topics")
    .select("id, slug");
  if (topicError) throw topicError;
  const topicIds = new Map(topicRows.map((topic) => [topic.slug, topic.id]));

  for (const [email, channels] of Object.entries(PREFERENCES)) {
    const { error } = await admin
      .from("notification_preferences")
      .upsert({ user_id: userIds.get(email), ...channels }, { onConflict: "user_id" });
    if (error) throw error;
  }

  const businessIds = new Map();
  for (const business of BUSINESSES) {
    const { data, error } = await admin
      .from("businesses")
      .upsert(
        {
          slug: business.slug,
          name: business.name,
          description: business.description,
          logo_url: business.logo_url,
          contact_email: business.contact_email,
          website_url: business.website_url,
          primary_topic_id: topicIds.get(business.primary_topic),
          status: "active",
          urgent_allowed: business.urgent_allowed,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (error) throw error;
    businessIds.set(business.slug, data.id);

    const { error: memberError } = await admin
      .from("business_members")
      .upsert(
        { business_id: data.id, user_id: userIds.get(business.owner), role: "owner" },
        { onConflict: "business_id,user_id" },
      );
    if (memberError) throw memberError;
  }

  const businessFollowRows = FOLLOWS.map((follow) => ({
    user_id: userIds.get(follow.email),
    business_id: businessIds.get(follow.business),
  }));
  const { error: followError } = await admin
    .from("business_follows")
    .upsert(businessFollowRows, { onConflict: "user_id,business_id" });
  if (followError) throw followError;

  const topicFollowRows = FOLLOWS.filter((follow) => follow.topic).map((follow) => ({
    user_id: userIds.get(follow.email),
    topic_id: topicIds.get(follow.topic),
  }));
  const { error: topicFollowError } = await admin
    .from("topic_follows")
    .upsert(topicFollowRows, { onConflict: "user_id,topic_id" });
  if (topicFollowError) throw topicFollowError;

  const seededBusinessIds = [...businessIds.values()];
  const { error: clearError } = await admin
    .from("announcements")
    .delete()
    .in("business_id", seededBusinessIds);
  if (clearError) throw clearError;

  for (const announcement of ANNOUNCEMENTS) {
    const { data, error } = await admin
      .from("announcements")
      .insert({
        business_id: businessIds.get(announcement.business),
        created_by: userIds.get(
          BUSINESSES.find((business) => business.slug === announcement.business).owner,
        ),
        title: announcement.title,
        body: announcement.body,
        importance: announcement.importance,
        status: "published",
        published_at: isoDaysAgo(announcement.daysAgo),
      })
      .select("id")
      .single();
    if (error) throw error;

    if (announcement.topics.length > 0) {
      const { error: tagError } = await admin.from("announcement_topics").insert(
        announcement.topics.map((slug) => ({
          announcement_id: data.id,
          topic_id: topicIds.get(slug),
        })),
      );
      if (tagError) throw tagError;
    }
  }

  const { count: notificationCount } = await admin
    .from("notifications")
    .select("id", { count: "exact", head: true });

  console.log("Seed complete.");
  console.log(`People: ${PEOPLE.length}`);
  console.log(`Businesses: ${BUSINESSES.length}`);
  console.log(`Announcements: ${ANNOUNCEMENTS.length}`);
  console.log(`Follows: ${FOLLOWS.length}`);
  console.log(`Notifications created by fan-out: ${notificationCount ?? 0}`);
  console.log("Accounts (magic-link sign in):");
  for (const person of PEOPLE) console.log(`- ${person.email} (${person.role})`);
}

main().catch((error) => {
  console.error("Seed failed:", error.message ?? error);
  process.exit(1);
});
