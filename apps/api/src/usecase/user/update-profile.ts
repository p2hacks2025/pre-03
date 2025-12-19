import type { DbClient } from "@packages/db";
import type {
  UpdateProfileInput,
  UpdateProfileOutput,
} from "@packages/schema/user";
import { updateUserProfile } from "@/repository/user-profile";
import { AppError } from "@/shared/error/app-error";

type UpdateProfileDeps = {
  db: DbClient;
};

type UpdateProfileParams = {
  userId: string;
  input: UpdateProfileInput;
};

export const updateProfile = async (
  deps: UpdateProfileDeps,
  params: UpdateProfileParams,
): Promise<UpdateProfileOutput> => {
  const { userId, input } = params;

  // displayName -> username へのマッピング
  const updateData = input.displayName ? { username: input.displayName } : {};

  const profile = await updateUserProfile(deps.db, userId, updateData);

  if (!profile) {
    throw new AppError("NOT_FOUND", {
      message: "プロフィールが見つかりません",
    });
  }

  return {
    profile: {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.username,
      avatarUrl: profile.avatarUrl,
      createdAt: profile.createdAt.toISOString(),
    },
  };
};
