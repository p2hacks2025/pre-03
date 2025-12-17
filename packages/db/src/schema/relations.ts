import { relations } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { aiPosts } from "./ai-posts";
import { aiProfiles } from "./ai-profiles";
import { userPosts } from "./user-posts";
import { userProfiles } from "./user-profiles";
import { weeklyWorlds } from "./weekly-worlds";
import { worldBuildLogs } from "./world-build-logs";

// user_profiles リレーション
export const userProfilesRelations = relations(
  userProfiles,
  ({ one, many }) => ({
    user: one(authUsers, {
      fields: [userProfiles.userId],
      references: [authUsers.id],
    }),
    userPosts: many(userPosts),
    weeklyWorlds: many(weeklyWorlds),
    aiPosts: many(aiPosts),
  }),
);

// user_posts リレーション
export const userPostsRelations = relations(userPosts, ({ one }) => ({
  userProfile: one(userProfiles, {
    fields: [userPosts.userProfileId],
    references: [userProfiles.id],
  }),
}));

// weekly_worlds リレーション
export const weeklyWorldsRelations = relations(
  weeklyWorlds,
  ({ one, many }) => ({
    userProfile: one(userProfiles, {
      fields: [weeklyWorlds.userProfileId],
      references: [userProfiles.id],
    }),
    worldBuildLogs: many(worldBuildLogs),
  }),
);

// ai_profiles リレーション
export const aiProfilesRelations = relations(aiProfiles, ({ many }) => ({
  aiPosts: many(aiPosts),
}));

// ai_posts リレーション
export const aiPostsRelations = relations(aiPosts, ({ one }) => ({
  aiProfile: one(aiProfiles, {
    fields: [aiPosts.aiProfileId],
    references: [aiProfiles.id],
  }),
  userProfile: one(userProfiles, {
    fields: [aiPosts.userProfileId],
    references: [userProfiles.id],
  }),
}));

// world_build_logs リレーション
export const worldBuildLogsRelations = relations(worldBuildLogs, ({ one }) => ({
  weeklyWorld: one(weeklyWorlds, {
    fields: [worldBuildLogs.weeklyWorldId],
    references: [weeklyWorlds.id],
  }),
}));
