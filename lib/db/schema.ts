import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    phone: text("phone").unique(),
    email: text("email").unique(),
    clerkId: text("clerk_id").unique(),
    role: text("role").notNull().default("customer"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("users_role_check", sql`${table.role} in ('customer', 'admin')`)],
);

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age"),
  sex: text("sex"),
  company: text("company"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    phone: text("phone"),
    email: text("email"),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("verifications_phone_idx").on(table.phone), index("verifications_email_idx").on(table.email)],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    category: text("category"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    coverPath: text("cover_path"),
    status: text("status").notNull().default("new"),
    hidden: boolean("hidden").notNull().default(false),
    adminReply: text("admin_reply"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("posts_author_idx").on(table.authorId),
    index("posts_feed_idx").on(table.type, table.hidden, table.createdAt),
    check(
      "posts_shape_check",
      sql`(
        ${table.type} = 'feedback'
        and ${table.category} in ('bug', 'feature', 'improvement')
        and ${table.status} in ('new', 'planned', 'in_progress', 'shipped')
      ) or (
        ${table.type} = 'support'
        and ${table.category} is null
        and ${table.status} in ('open', 'answered', 'closed')
      )`,
    ),
    check("posts_title_check", sql`char_length(${table.title}) between 3 and 140`),
  ],
);

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    size: integer("size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("attachments_post_idx").on(table.postId)],
);

export const upvotes = pgTable(
  "upvotes",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ name: "upvotes_pkey", columns: [table.postId, table.userId] }),
    index("upvotes_post_idx").on(table.postId),
  ],
);

export const changelogEntries = pgTable("changelog_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const changelogPosts = pgTable(
  "changelog_posts",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => changelogEntries.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ name: "changelog_posts_pkey", columns: [table.entryId, table.postId] }),
    index("changelog_posts_post_idx").on(table.postId),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
export type VerificationRow = typeof verifications.$inferSelect;
export type PostRow = typeof posts.$inferSelect;
export type AttachmentRow = typeof attachments.$inferSelect;
export type ChangelogEntryRow = typeof changelogEntries.$inferSelect;
