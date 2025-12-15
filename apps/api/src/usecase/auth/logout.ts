import type { LogoutOutput } from "@packages/schema/auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/shared/error/app-error";

type LogoutDeps = {
  supabase: SupabaseClient;
};

export const logout = async (deps: LogoutDeps): Promise<LogoutOutput> => {
  const { error } = await deps.supabase.auth.signOut();

  if (error) {
    throw new AppError("INTERNAL_SERVER_ERROR", {
      message: "ログアウトに失敗しました",
      cause: error,
    });
  }

  return { success: true };
};
