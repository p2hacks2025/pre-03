import type { DbClient } from "@packages/db";
import type { GetMeOutput } from "@packages/schema/user";
import type { User } from "@supabase/supabase-js";
import { getUserProfileByUserId } from "@/repository/user-profile";

type GetMeDeps = {
  db: DbClient;
};

type GetMeInput = {
  user: User;
};

export const getMe = async (
  deps: GetMeDeps,
  input: GetMeInput,
): Promise<GetMeOutput> => {
  const profile = await getUserProfileByUserId(deps.db, input.user.id);

  return {
    user: {
      id: input.user.id,
      email: input.user.email ?? "",
      createdAt: input.user.created_at,
    },
    profile: profile
      ? {
          id: profile.id,
          userId: profile.userId,
          displayName: profile.name,
          avatarUrl: profile.iconUrl,
          createdAt: profile.createdAt.toISOString(),
        }
      : null,
  };
};
