import { createClient } from "@supabase/supabase-js";
import type { Bindings } from "@/context";

export const createSupabaseClient = (env: Bindings) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
};

/**
 * サービスロールキーを使った管理者クライアントを作成
 * RLS をバイパスするため、サーバーサイドでの操作に使用
 */
export const createSupabaseAdminClient = (env: Bindings) => {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations",
    );
  }
  return createClient(env.SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
