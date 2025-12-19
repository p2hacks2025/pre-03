ALTER TABLE "ai_posts" ALTER COLUMN "published_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_posts" DROP COLUMN "scheduled_at";
