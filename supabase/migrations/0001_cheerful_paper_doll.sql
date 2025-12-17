CREATE TABLE "ai_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_profile_id" uuid NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"source_start_at" timestamp with time zone NOT NULL,
	"source_end_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ai_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"icon_url" text,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"content" text NOT NULL,
	"upload_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "weekly_worlds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"week_start_date" date NOT NULL,
	"weekly_world_image_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "weekly_worlds_user_week_unique" UNIQUE("user_profile_id","week_start_date")
);
--> statement-breakpoint
CREATE TABLE "world_build_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"weekly_world_id" uuid NOT NULL,
	"create_date" date NOT NULL,
	"field_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "world_build_logs_world_field_unique" UNIQUE("weekly_world_id","field_id"),
	CONSTRAINT "world_build_logs_field_id_check" CHECK ("world_build_logs"."field_id" >= 0 AND "world_build_logs"."field_id" <= 8)
);
--> statement-breakpoint
ALTER TABLE "profiles" RENAME TO "user_profiles";--> statement-breakpoint
ALTER TABLE "user_profiles" RENAME COLUMN "display_name" TO "name";--> statement-breakpoint
ALTER TABLE "user_profiles" RENAME COLUMN "avatar_url" TO "icon_url";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP CONSTRAINT "profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_posts" ADD CONSTRAINT "ai_posts_ai_profile_id_ai_profiles_id_fk" FOREIGN KEY ("ai_profile_id") REFERENCES "public"."ai_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_posts" ADD CONSTRAINT "ai_posts_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_posts" ADD CONSTRAINT "user_posts_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_worlds" ADD CONSTRAINT "weekly_worlds_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_build_logs" ADD CONSTRAINT "world_build_logs_weekly_world_id_weekly_worlds_id_fk" FOREIGN KEY ("weekly_world_id") REFERENCES "public"."weekly_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id");