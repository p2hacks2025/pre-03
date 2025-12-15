import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbClient } from "../../client";

export interface SeedOptions {
  /** 既存データを削除して再作成 */
  force: boolean;
  /** 実行前にauth.users + profilesを全削除 */
  reset: boolean;
}

export interface SeedContext {
  db: DbClient;
  adminSupabase: SupabaseClient;
  options: SeedOptions;
}

export interface Seeder {
  name: string;
  seed(ctx: SeedContext): Promise<void>;
  reset?(ctx: SeedContext): Promise<void>;
}
