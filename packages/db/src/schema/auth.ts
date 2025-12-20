import { authUsers } from "drizzle-orm/supabase";

// drizzle-orm/supabase の authUsers を再エクスポート
export { authUsers };

// 型定義
export type AuthUser = typeof authUsers.$inferSelect;
export type NewAuthUser = typeof authUsers.$inferInsert;
