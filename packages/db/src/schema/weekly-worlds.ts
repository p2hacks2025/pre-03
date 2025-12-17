import {
  date,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { userProfiles } from "./user-profiles";

export const weeklyWorlds = pgTable(
  "weekly_worlds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userProfileId: uuid("user_profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    weekStartDate: date("week_start_date", { mode: "date" }).notNull(),
    weeklyWorldImageUrl: text("weekly_world_image_url").notNull(),
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
    unique("weekly_worlds_user_week_unique").on(
      table.userProfileId,
      table.weekStartDate,
    ),
  ],
);

export type WeeklyWorld = typeof weeklyWorlds.$inferSelect;
export type NewWeeklyWorld = typeof weeklyWorlds.$inferInsert;
export type WeeklyWorldUpdate = Partial<
  Pick<NewWeeklyWorld, "weeklyWorldImageUrl">
>;
