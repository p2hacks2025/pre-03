import type { authUsers } from "drizzle-orm/supabase";

// そのまま Drizzle のテーブルオブジェクトとして使える
export type AuthUser = typeof authUsers.$inferSelect;
export type NewAuthUser = typeof authUsers.$inferInsert;
