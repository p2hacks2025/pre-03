import type { DbClient } from "@packages/db";
import type { SignupInput, SignupOutput } from "@packages/schema/auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createProfile } from "@/repository/profile";
import { AppError } from "@/shared/error/app-error";

type SignupDeps = {
  supabase: SupabaseClient;
  db: DbClient;
};

export const signup = async (
  deps: SignupDeps,
  input: SignupInput,
): Promise<SignupOutput> => {
  const { data, error } = await deps.supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (error) {
    if (error.message.includes("already registered")) {
      throw new AppError("CONFLICT", {
        message: "このメールアドレスは既に登録されています",
      });
    }
    throw new AppError("BAD_REQUEST", {
      message: error.message,
    });
  }

  if (!data.user || !data.session) {
    throw new AppError("INTERNAL_SERVER_ERROR", {
      message: "ユーザー登録に失敗しました",
    });
  }

  await createProfile(deps.db, {
    userId: data.user.id,
    displayName: input.displayName,
  });

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
