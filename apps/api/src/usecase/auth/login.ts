import type { LoginInput, LoginOutput } from "@packages/schema/auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/shared/error/app-error";

type LoginDeps = {
  supabase: SupabaseClient;
};

export const login = async (
  deps: LoginDeps,
  input: LoginInput,
): Promise<LoginOutput> => {
  const { data, error } = await deps.supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw new AppError("UNAUTHORIZED", {
        message: "メールアドレスまたはパスワードが正しくありません",
      });
    }
    throw new AppError("BAD_REQUEST", {
      message: error.message,
    });
  }

  if (!data.user || !data.session) {
    throw new AppError("INTERNAL_SERVER_ERROR", {
      message: "ログインに失敗しました",
    });
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? "",
      createdAt: data.user.created_at,
    },
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
    },
  };
};
