/**
 * Seeds demo feedback data for local development.
 *
 * Run with `npm run seed`. It replaces only the demo rows it owns (users with
 * the 091200000xx range and admin@feedback.local) and leaves other data alone.
 */
import {
  changelogEntries,
  changelogPosts,
  posts,
  profiles,
  upvotes,
  users,
} from "../lib/db/schema";
import { getDb } from "../lib/db";
import { inArray, or, eq } from "drizzle-orm";

try {
  process.loadEnvFile(".env");
} catch {
  // The environment may already come from the shell.
}

const DEMO_PHONES = [
  "09120000001",
  "09120000002",
  "09120000003",
  "09120000004",
];
const ADMIN_EMAIL = "admin@feedback.local";
const DEMO_ENTRY_TITLES = ["جستجوی بازخوردها و تاریخ شمسی"];

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main(): Promise<void> {
  const db = getDb();

  await db
    .delete(users)
    .where(or(inArray(users.phone, DEMO_PHONES), eq(users.email, ADMIN_EMAIL)));

  await db.delete(changelogEntries).where(inArray(changelogEntries.title, DEMO_ENTRY_TITLES));

  const [admin] = await db
    .insert(users)
    .values({ email: ADMIN_EMAIL, role: "admin" })
    .returning({ id: users.id });
  const [sepideh] = await db
    .insert(users)
    .values({ phone: DEMO_PHONES[0], role: "customer" })
    .returning({ id: users.id });
  const [reza] = await db
    .insert(users)
    .values({ phone: DEMO_PHONES[1], role: "customer" })
    .returning({ id: users.id });
  const [sara] = await db
    .insert(users)
    .values({ phone: DEMO_PHONES[2], role: "customer" })
    .returning({ id: users.id });

  if (!admin || !sepideh || !reza || !sara) throw new Error("seed_users_failed");

  await db.insert(profiles).values([
    { userId: admin.id, name: "تیم محصول" },
    { userId: sepideh.id, name: "سپیده" },
    { userId: reza.id, name: "رضا" },
    { userId: sara.id, name: "سارا" },
  ]);

  const inserted = await db
    .insert(posts)
    .values([
      {
        authorId: sepideh.id,
        type: "feedback",
        category: "feature",
        title: "پیگیری وضعیت درخواست‌ها در یک صفحه",
        product: "دستیار",
        body: "هر بار باید بین ایمیل و پیام‌ها دنبال پاسخ بگردم.\n\nیک صفحه می‌خواهم که همه درخواست‌هایم با **وضعیت به‌روز** در آن باشد.",
        status: "planned",
        createdAt: daysAgo(18),
        updatedAt: daysAgo(12),
      },
      {
        authorId: reza.id,
        type: "feedback",
        category: "bug",
        title: "دکمه ارسال در موبایل زیر کیبورد می‌رود",
        product: "دستیار",
        body: "وقتی فرم را در موبایل پر می‌کنم، دکمه ارسال زیر کیبورد پنهان می‌شود و باید صفحه را دستی جابه‌جا کنم.",
        status: "in_progress",
        createdAt: daysAgo(9),
        updatedAt: daysAgo(2),
      },
      {
        authorId: sara.id,
        type: "feedback",
        category: "improvement",
        title: "نمایش فایل پیوست به شکل تصویر کوچک",
        product: "فروشگاه من",
        body: "به جای لینک ساده، تصویر پیوست را کوچک نشان بدهید تا سریع‌تر مشخص شود چه فایلی فرستاده‌ام.",
        status: "new",
        createdAt: daysAgo(6),
        updatedAt: daysAgo(6),
      },
      {
        authorId: sepideh.id,
        type: "feedback",
        category: "feature",
        title: "لینک عمومی برای اشتراک‌گذاری نقشه راه",
        product: "دستیار",
        body: "می‌خواهم نقشه راه را با هم‌تیمی‌ها به اشتراک بگذارم. یک لینک کوتاه و ثابت برای این کار کافی است.",
        status: "planned",
        createdAt: daysAgo(5),
        updatedAt: daysAgo(4),
      },
      {
        authorId: reza.id,
        type: "feedback",
        category: "bug",
        title: "شمارنده رای بعد از رفرش جابه‌جا می‌شود",
        product: "دستیار",
        body: "رای که می‌دهم عدد درست است، اما با یک بار رفرش یک عدد جابه‌جا می‌شود. احتمالا کش صفحه.",
        status: "new",
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },
      {
        authorId: sara.id,
        type: "feedback",
        category: "improvement",
        title: "جستجو در فید بازخوردها",
        product: "feedback.local",
        body: "با زیاد شدن بازخوردها پیدا کردن موارد تکراری سخت می‌شود. یک جستجوی ساده بالای فید کمک می‌کند.",
        status: "shipped",
        createdAt: daysAgo(30),
        updatedAt: daysAgo(20),
      },
      {
        authorId: sepideh.id,
        type: "support",
        title: "ورود با شماره کار نمی‌کند",
        product: "دستیار",
        body: "کد پیامکی برای شماره من نمی‌آید. شماره را درست وارد کرده‌ام و پیام‌های تبلیغاتی را هم بستم.",
        status: "answered",
        adminReply: "سلام. ارسال پیامک را بررسی کردیم و مشکل از سمت اپراتور بود. دوباره درخواست کد بده، این بار باید برسد.",
        createdAt: daysAgo(7),
        updatedAt: daysAgo(6),
      },
      {
        authorId: reza.id,
        type: "feedback",
        category: "feature",
        title: "تاریخ شمسی روی کارت‌های فید",
        product: "دستیار",
        body: "تاریخ‌ها به شمسی باشند تا خواندنشان برای تیم ما ساده‌تر شود.",
        status: "shipped",
        createdAt: daysAgo(26),
        updatedAt: daysAgo(22),
      },
    ])
    .returning({ id: posts.id, title: posts.title });

  function idOf(title: string): string {
    const row = inserted.find((post) => post.title === title);
    if (!row) throw new Error(`seed_post_missing:${title}`);
    return row.id;
  }

  const searchPost = idOf("جستجو در فید بازخوردها");
  const datePost = idOf("تاریخ شمسی روی کارت‌های فید");
  const mobilePost = idOf("دکمه ارسال در موبایل زیر کیبورد می‌رود");
  const myRequestsPost = idOf("پیگیری وضعیت درخواست‌ها در یک صفحه");
  const thumbnailPost = idOf("نمایش فایل پیوست به شکل تصویر کوچک");

  await db.insert(upvotes).values([
    { postId: myRequestsPost, userId: reza.id },
    { postId: myRequestsPost, userId: sara.id },
    { postId: myRequestsPost, userId: admin.id },
    { postId: mobilePost, userId: sepideh.id },
    { postId: mobilePost, userId: sara.id },
    { postId: thumbnailPost, userId: sepideh.id },
    { postId: thumbnailPost, userId: reza.id },
    { postId: mobilePost, userId: admin.id },
  ]);

  const [entry] = await db
    .insert(changelogEntries)
    .values({
      title: "جستجوی بازخوردها و تاریخ شمسی",
      body: "## چه چیزی تازه است\n\n- جستجو در فید بازخوردها\n- نمایش تاریخ شمسی روی کارت‌ها\n\nهر دو مورد از بازخوردهای همین تابلو شروع شد.",
      publishedAt: daysAgo(20),
      createdAt: daysAgo(20),
    })
    .returning({ id: changelogEntries.id });

  if (!entry) throw new Error("seed_changelog_failed");

  await db
    .insert(changelogPosts)
    .values([
      { entryId: entry.id, postId: searchPost },
      { entryId: entry.id, postId: datePost },
    ])
    .onConflictDoNothing();

  console.log("Demo feedback seeded.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
