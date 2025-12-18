ALTER TABLE "ai_posts" ADD COLUMN "scheduled_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_posts" ADD COLUMN "published_at" timestamp with time zone;