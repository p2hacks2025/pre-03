import { relations } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { profiles } from "./profiles";

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(authUsers, {
    fields: [profiles.userId],
    references: [authUsers.id],
  }),
}));
