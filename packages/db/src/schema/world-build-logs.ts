import { sql } from "drizzle-orm";
import {
  check,
  date,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { weeklyWorlds } from "./weekly-worlds";

export const worldBuildLogs = pgTable(
  "world_build_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weeklyWorldId: uuid("weekly_world_id")
      .notNull()
      .references(() => weeklyWorlds.id, { onDelete: "cascade" }),
    createDate: date("create_date", { mode: "date" }).notNull(),
    fieldId: integer("field_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("world_build_logs_world_field_unique").on(
      table.weeklyWorldId,
      table.fieldId,
    ),
    check(
      "world_build_logs_field_id_check",
      sql`${table.fieldId} >= 0 AND ${table.fieldId} <= 8`,
    ),
  ],
);

export type WorldBuildLog = typeof worldBuildLogs.$inferSelect;
export type NewWorldBuildLog = typeof worldBuildLogs.$inferInsert;
