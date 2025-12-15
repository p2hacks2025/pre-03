import type {
  PasswordResetInput,
  PasswordResetOutput,
} from "@packages/schema/auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/shared/error/app-error";

type PasswordResetDeps = {
  supabase: SupabaseClient;
};

export const passwordReset = async (
  deps: PasswordResetDeps,
  input: PasswordResetInput,
): Promise<PasswordResetOutput> => {
  const { error } = await deps.supabase.auth.resetPasswordForEmail(input.email);

  if (error) {
    throw new AppError("BAD_REQUEST", {
      message: error.message,
    });
  }

  return {
    success: true,
    message: "パスワードリセットメールを送信しました",
  };
};
