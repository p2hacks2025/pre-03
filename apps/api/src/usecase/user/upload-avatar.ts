import type { DbClient } from "@packages/db";
import type { UploadAvatarOutput } from "@packages/schema/user";
import type { SupabaseClient } from "@supabase/supabase-js";
import { updateProfile } from "@/repository/profile";
import { AppError } from "@/shared/error/app-error";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type UploadAvatarDeps = {
  supabase: SupabaseClient;
  db: DbClient;
};

type UploadAvatarInput = {
  userId: string;
  file: File;
};

export const uploadAvatar = async (
  deps: UploadAvatarDeps,
  input: UploadAvatarInput,
): Promise<UploadAvatarOutput> => {
  const { file, userId } = input;

  // 1. ファイル検証
  if (file.size > MAX_FILE_SIZE) {
    throw new AppError("BAD_REQUEST", {
      message: "ファイルサイズは5MB以下にしてください",
    });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new AppError("BAD_REQUEST", {
      message: "対応形式は JPEG, PNG, WebP です",
    });
  }

  // 2. ファイル名生成（userId/timestamp.ext）
  const ext = file.type.split("/")[1];
  const fileName = `${userId}/${Date.now()}.${ext}`;

  // 3. Storage にアップロード
  const { error } = await deps.supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    throw new AppError("INTERNAL_SERVER_ERROR", {
      message: `アップロード失敗: ${error.message}`,
    });
  }

  // 4. 公開 URL 取得
  const { data: publicData } = deps.supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  const avatarUrl = publicData.publicUrl;

  // 5. DB 更新
  await updateProfile(deps.db, userId, { avatarUrl });

  return { avatarUrl };
};
