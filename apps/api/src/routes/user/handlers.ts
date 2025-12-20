import type { AppRouteHandler } from "@/context";
import { createSupabaseAdminClient } from "@/infrastructure/supabase";
import { getUserProfileByUserId } from "@/repository/user-profile";
import { AppError } from "@/shared/error/app-error";
import {
  getMe,
  getProfileStats,
  updateProfile,
  uploadAvatar,
} from "@/usecase/user";
import type {
  getMeRoute,
  getProfileStatsRoute,
  updateProfileRoute,
  uploadAvatarRoute,
} from "./route";

export const getMeHandler: AppRouteHandler<typeof getMeRoute> = async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const result = await getMe({ db }, { user });

  return c.json(result);
};

export const uploadAvatarHandler: AppRouteHandler<
  typeof uploadAvatarRoute
> = async (c) => {
  // parseBody() で multipart/form-data を解析（Hono推奨）
  // 参考: https://hono.dev/examples/file-upload
  const body = await c.req.parseBody();
  const file = body.file;

  // File オブジェクトかどうかを検証
  if (!file || !(file instanceof File)) {
    throw new AppError("BAD_REQUEST", { message: "ファイルが必須です" });
  }

  const user = c.get("user");
  const db = c.get("db");
  // Storage 操作にはサービスロールキーを使用（RLSバイパス）
  const supabaseAdmin = createSupabaseAdminClient(c.env);

  const result = await uploadAvatar(
    { supabase: supabaseAdmin, db },
    { userId: user.id, file },
  );

  return c.json(result);
};

export const updateProfileHandler: AppRouteHandler<
  typeof updateProfileRoute
> = async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const input = c.req.valid("json");

  const result = await updateProfile({ db }, { userId: user.id, input });

  return c.json(result);
};

export const getProfileStatsHandler: AppRouteHandler<
  typeof getProfileStatsRoute
> = async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const profile = await getUserProfileByUserId(db, user.id);
  if (!profile) {
    throw new AppError("NOT_FOUND", {
      message: "プロフィールが見つかりません",
    });
  }

  const result = await getProfileStats({ db }, { profileId: profile.id });

  return c.json(result);
};
