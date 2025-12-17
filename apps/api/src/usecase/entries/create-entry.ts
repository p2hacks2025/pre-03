import type { DbClient } from "@packages/db";
import type { CreateEntryOutput } from "@packages/schema/entry";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createUserPost } from "@/repository/user-post";
import { getUserProfileByUserId } from "@/repository/user-profile";
import { AppError } from "@/shared/error/app-error";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

type CreateEntryDeps = {
  supabase: SupabaseClient;
  db: DbClient;
};

type CreateEntryInput = {
  userId: string;
  content: string;
  file?: File;
};

export const createEntry = async (
  deps: CreateEntryDeps,
  input: CreateEntryInput,
): Promise<CreateEntryOutput> => {
  const { db, supabase } = deps;
  const { userId, content, file } = input;

  let uploadImageUrl: string | null = null;
  let uploadedFileName: string | null = null;

  if (file) {
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError("BAD_REQUEST", {
        message: "ファイルサイズは5MB以下にしてください",
      });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new AppError("BAD_REQUEST", {
        message: "対応形式は JPEG, PNG です",
      });
    }
  }

  try {
    const post = await db.transaction(async (tx) => {
      const profile = await getUserProfileByUserId(tx, userId);
      if (!profile) {
        throw new AppError("NOT_FOUND", {
          message: "プロフィールが見つかりません",
        });
      }

      if (file) {
        const ext = file.type.split("/")[1];
        uploadedFileName = `${profile.id}/${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from("entries")
          .upload(uploadedFileName, file, {
            cacheControl: "3600",
          });

        if (error) {
          throw new AppError("INTERNAL_SERVER_ERROR", {
            message: `アップロード失敗: ${error.message}`,
          });
        }

        const { data: publicData } = supabase.storage
          .from("entries")
          .getPublicUrl(uploadedFileName);

        uploadImageUrl = publicData.publicUrl;
      }

      return await createUserPost(tx, {
        userProfileId: profile.id,
        content,
        uploadImageUrl,
      });
    });

    return {
      id: post.id,
      content: post.content,
      uploadImageUrl: post.uploadImageUrl,
      createdAt: post.createdAt.toISOString(),
    };
  } catch (error) {
    if (uploadedFileName) {
      await supabase.storage.from("entries").remove([uploadedFileName]);
    }
    throw error;
  }
};
