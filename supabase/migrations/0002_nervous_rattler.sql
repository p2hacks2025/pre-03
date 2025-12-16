ALTER TABLE "ai_profiles" RENAME COLUMN "name" TO "username";--> statement-breakpoint
ALTER TABLE "ai_profiles" RENAME COLUMN "icon_url" TO "avatar_url";--> statement-breakpoint
ALTER TABLE "user_profiles" RENAME COLUMN "name" TO "username";--> statement-breakpoint
ALTER TABLE "user_profiles" RENAME COLUMN "icon_url" TO "avatar_url";--> statement-breakpoint
ALTER TABLE "ai_posts" ADD CONSTRAINT "ai_posts_source_date_range_check" CHECK ("ai_posts"."source_start_at" <= "ai_posts"."source_end_at");