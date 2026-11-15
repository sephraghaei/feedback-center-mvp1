ALTER TABLE "profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "avatar_path" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_bio_check" CHECK ("profiles"."bio" is null or char_length("profiles"."bio") <= 280);