import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const aiProfiles = pgTable("ai_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  iconUrl: text("icon_url"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type AiProfile = typeof aiProfiles.$inferSelect;
export type NewAiProfile = typeof aiProfiles.$inferInsert;
export type AiProfileUpdate = Partial<
  Pick<NewAiProfile, "name" | "iconUrl" | "description">
>;
