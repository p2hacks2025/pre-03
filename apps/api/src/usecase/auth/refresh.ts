import type {
  RefreshTokenInput,
  RefreshTokenOutput,
} from "@packages/schema/auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/shared/error/app-error";

type RefreshDeps = {
  supabase: SupabaseClient;
};

type RefreshInput = RefreshTokenInput & {
  /** Web 用: Cookie から取得したリフレッシュトークン */
  cookieRefreshToken?: string;
};

export const refresh = async (
  deps: RefreshDeps,
  input: RefreshInput,
): Promise<RefreshTokenOutput> => {
  // Native からのリクエストはボディから、Web は Cookie から取得
  const token = input.refreshToken ?? input.cookieRefreshToken;

  if (!token) {
    throw new AppError("BAD_REQUEST", {
      message: "リフレッシュトークンが必要です",
    });
  }

  const { data, error } = await deps.supabase.auth.refreshSession({
    refresh_token: token,
  });

  if (error) {
    if (
      error.message.includes("Invalid Refresh Token") ||
      error.message.includes("Refresh Token Not Found")
    ) {
      throw new AppError("UNAUTHORIZED", {
        message: "リフレッシュトークンが無効または期限切れです",
      });
    }
    throw new AppError("INTERNAL_SERVER_ERROR", {
      message: "トークンの更新に失敗しました",
      cause: error,
    });
  }

  if (!data.session) {
    throw new AppError("INTERNAL_SERVER_ERROR", {
      message: "トークンの更新に失敗しました",
    });
  }

  return {
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
    },
  };
};
