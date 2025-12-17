import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userProfiles } from "./user-profiles";

export const userPosts = pgTable("user_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  uploadImageUrl: text("upload_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type UserPost = typeof userPosts.$inferSelect;
export type NewUserPost = typeof userPosts.$inferInsert;
export type UserPostUpdate = Partial<
  Pick<NewUserPost, "content" | "uploadImageUrl">
>;
