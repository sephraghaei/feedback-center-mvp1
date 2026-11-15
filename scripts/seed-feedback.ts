/**
 * Seeds demo feedback data for local development.
 *
 * Run with `npm run seed`. It replaces only the demo rows it owns (users with
 * the 091200000xx range and admin@feedback.local) and leaves other data alone.
 */
import {
  changelogEntries,
  changelogPosts,
  commentVotes,
  comments,
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
const DEMO_ENTRY_TITLES = ["جستجوی فید‌بک‌ها و تاریخ شمسی"];

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
        title: "جستجو در فید‌بک‌ها",
        product: "feedback.local",
        body: "با زیاد شدن فید‌بک‌ها پیدا کردن موارد تکراری سخت می‌شود. یک جستجوی ساده بالای فید کمک می‌کند.",
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

  const searchPost = idOf("جستجو در فید‌بک‌ها");
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

  const insertedComments = await db
    .insert(comments)
    .values([
      {
        postId: mobilePost,
        authorId: sara.id,
        body: "همین مشکل را در آیفون هم دارم. وقتی کیبورد باز است، نوار پایین فرم کامل پنهان می‌شود.",
        createdAt: daysAgo(8),
      },
      {
        postId: mobilePost,
        authorId: sepideh.id,
        body: "روی اندروید هم دکمه زیر کیبورد می‌رود، فقط با درگ کردن صفحه درست می‌شود.",
        createdAt: daysAgo(6),
      },
      {
        postId: myRequestsPost,
        authorId: admin.id,
        body: "این را در نوبت گذاشتیم. تا آن موقع می‌توانی درخواست‌های باز را از صفحه درخواست‌های من ببینی.",
        createdAt: daysAgo(11),
      },
      {
        postId: myRequestsPost,
        authorId: reza.id,
        body: "صفحه درخواست‌ها هست، اما وضعیت‌ها به‌روز نیست. همان چیزی که اینجا نوشته شده را می‌خواهم.",
        createdAt: daysAgo(10),
      },
      {
        postId: thumbnailPost,
        authorId: sepideh.id,
        body: "تصویر کوچک بهتر از لینک است، اما برای فایل‌های بزرگ هم یک پیش‌نمایش بگذارید.",
        createdAt: daysAgo(4),
      },
    ])
    .returning({ id: comments.id, body: comments.body });

  function commentOf(body: string): string {
    const row = insertedComments.find((comment) => comment.body === body);
    if (!row) throw new Error(`seed_comment_missing:${body}`);
    return row.id;
  }

  const iosComment = commentOf(
    "همین مشکل را در آیفون هم دارم. وقتی کیبورد باز است، نوار پایین فرم کامل پنهان می‌شود.",
  );
  const androidComment = commentOf(
    "روی اندروید هم دکمه زیر کیبورد می‌رود، فقط با درگ کردن صفحه درست می‌شود.",
  );
  const trackedComment = commentOf(
    "این را در نوبت گذاشتیم. تا آن موقع می‌توانی درخواست‌های باز را از صفحه درخواست‌های من ببینی.",
  );
  const thumbnailComment = commentOf(
    "تصویر کوچک بهتر از لینک است، اما برای فایل‌های بزرگ هم یک پیش‌نمایش بگذارید.",
  );

  const insertedReplies = await db
    .insert(comments)
    .values([
      {
        postId: mobilePost,
        authorId: reza.id,
        parentId: iosComment,
        body: "من هم روی آیفون همین را دیدم. اگر دکمه ارسال بالای کیبورد ثابت شود، مشکل حل می‌شود.",
        createdAt: daysAgo(7),
      },
      {
        postId: mobilePost,
        authorId: admin.id,
        parentId: androidComment,
        body: "در نسخه بعدی دکمه ارسال را بالای کیبورد می‌گذاریم. ممنون که دقیق گزارش دادی.",
        createdAt: daysAgo(5),
      },
      {
        postId: myRequestsPost,
        authorId: sepideh.id,
        parentId: trackedComment,
        body: "ممنون. پس منتظر می‌مانم و تا آن موقع وضعیت‌ها را از همان صفحه چک می‌کنم.",
        createdAt: daysAgo(9),
      },
    ])
    .returning({ id: comments.id, body: comments.body });

  function replyOf(body: string): string {
    const row = insertedReplies.find((comment) => comment.body === body);
    if (!row) throw new Error(`seed_reply_missing:${body}`);
    return row.id;
  }

  const iosReply = replyOf(
    "من هم روی آیفون همین را دیدم. اگر دکمه ارسال بالای کیبورد ثابت شود، مشکل حل می‌شود.",
  );
  const planningReply = replyOf(
    "در نسخه بعدی دکمه ارسال را بالای کیبورد می‌گذاریم. ممنون که دقیق گزارش دادی.",
  );
  const waitReply = replyOf(
    "ممنون. پس منتظر می‌مانم و تا آن موقع وضعیت‌ها را از همان صفحه چک می‌کنم.",
  );

  await db.insert(commentVotes).values([
    { commentId: iosComment, userId: reza.id, value: 1 },
    { commentId: iosComment, userId: sepideh.id, value: 1 },
    { commentId: iosComment, userId: admin.id, value: 1 },
    { commentId: androidComment, userId: sara.id, value: 1 },
    { commentId: trackedComment, userId: sepideh.id, value: 1 },
    { commentId: trackedComment, userId: reza.id, value: 1 },
    { commentId: thumbnailComment, userId: sara.id, value: 1 },
    { commentId: thumbnailComment, userId: reza.id, value: -1 },
    { commentId: iosReply, userId: sepideh.id, value: 1 },
    { commentId: iosReply, userId: sara.id, value: 1 },
    { commentId: planningReply, userId: sepideh.id, value: 1 },
    { commentId: planningReply, userId: sara.id, value: 1 },
    { commentId: waitReply, userId: reza.id, value: 1 },
  ]);

  const [entry] = await db
    .insert(changelogEntries)
    .values({
      title: "جستجوی فید‌بک‌ها و تاریخ شمسی",
      body: "## چه چیزی تازه است\n\n- جستجو در فید‌بک‌ها\n- نمایش تاریخ شمسی روی کارت‌ها\n\nهر دو مورد از فید‌بک‌های همین تابلو شروع شد.",
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
