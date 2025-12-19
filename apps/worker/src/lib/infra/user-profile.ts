import { isNull, type UserProfile, userProfiles } from "@packages/db";
import type { WorkerContext } from "../context";

export const getAllUserProfiles = async (
  ctx: WorkerContext,
): Promise<UserProfile[]> => {
  return ctx.db
    .select()
    .from(userProfiles)
    .where(isNull(userProfiles.deletedAt));
};
