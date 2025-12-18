import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { aiProfiles } from "./ai-profiles";
import { userProfiles } from "./user-profiles";

export const aiPosts = pgTable(
  "ai_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aiProfileId: uuid("ai_profile_id")
      .notNull()
      .references(() => aiProfiles.id, { onDelete: "cascade" }),
    userProfileId: uuid("user_profile_id").references(() => userProfiles.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    sourceStartAt: timestamp("source_start_at", {
      withTimezone: true,
    }).notNull(),
    sourceEndAt: timestamp("source_end_at", { withTimezone: true }).notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    check(
      "ai_posts_source_date_range_check",
      sql`${table.sourceStartAt} <= ${table.sourceEndAt}`,
    ),
  ],
);

export type AiPost = typeof aiPosts.$inferSelect;
export type NewAiPost = typeof aiPosts.$inferInsert;
export type AiPostUpdate = Partial<
  Pick<NewAiPost, "content" | "imageUrl" | "publishedAt">
>;
