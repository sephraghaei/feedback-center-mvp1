CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changelog_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changelog_posts" (
	"entry_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	CONSTRAINT "changelog_posts_pkey" PRIMARY KEY("entry_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"type" text NOT NULL,
	"category" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"cover_path" text,
	"status" text DEFAULT 'new' NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"admin_reply" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_shape_check" CHECK ((
        "posts"."type" = 'feedback'
        and "posts"."category" in ('bug', 'feature', 'improvement')
        and "posts"."status" in ('new', 'planned', 'in_progress', 'shipped')
      ) or (
        "posts"."type" = 'support'
        and "posts"."category" is null
        and "posts"."status" in ('open', 'answered', 'closed')
      )),
	CONSTRAINT "posts_title_check" CHECK (char_length("posts"."title") between 3 and 140)
);
--> statement-breakpoint
CREATE TABLE "upvotes" (
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "upvotes_pkey" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changelog_posts" ADD CONSTRAINT "changelog_posts_entry_id_changelog_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."changelog_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changelog_posts" ADD CONSTRAINT "changelog_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_post_idx" ON "attachments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "changelog_posts_post_idx" ON "changelog_posts" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "posts_feed_idx" ON "posts" USING btree ("type","hidden","created_at");--> statement-breakpoint
CREATE INDEX "upvotes_post_idx" ON "upvotes" USING btree ("post_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK ("users"."role" in ('customer', 'admin'));