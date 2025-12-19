import type { WorkerContext } from "@/lib";
import {
  fetchAllUserProfiles,
  fetchUserPostsForWeek,
  findWeeklyWorldForUser,
  getNextWeekStart,
  getTargetWeekStart,
  processUserWeeklyResetWithoutPosts,
  processUserWeeklyResetWithPosts,
} from "@/tasks";

export type WeeklyResetResult = {
  success: boolean;
  targetWeekStart: string;
  newWeekStart: string;
  processedUsers: number;
  skippedUsers: number;
  errors: string[];
};

export const weeklyReset = async (
  ctx: WorkerContext,
): Promise<WeeklyResetResult> => {
  const targetWeekStart = getTargetWeekStart(ctx);
  const newWeekStart = getNextWeekStart(targetWeekStart);

  ctx.logger.info("Starting weekly-reset", {
    targetWeekStart: targetWeekStart.toISOString().split("T")[0],
    newWeekStart: newWeekStart.toISOString().split("T")[0],
  });

  const result: WeeklyResetResult = {
    success: true,
    targetWeekStart: targetWeekStart.toISOString().split("T")[0],
    newWeekStart: newWeekStart.toISOString().split("T")[0],
    processedUsers: 0,
    skippedUsers: 0,
    errors: [],
  };

  const userProfiles = await fetchAllUserProfiles(ctx);

  if (userProfiles.length === 0) {
    ctx.logger.info("No active users, skipping");
    return result;
  }

  for (const profile of userProfiles) {
    try {
      const existingNewWeekWorld = await findWeeklyWorldForUser(
        ctx,
        profile.id,
        newWeekStart,
      );
      if (existingNewWeekWorld) {
        result.skippedUsers++;
        continue;
      }

      const posts = await fetchUserPostsForWeek(
        ctx,
        profile.id,
        targetWeekStart,
      );

      if (posts.length > 0) {
        await processUserWeeklyResetWithPosts(
          ctx,
          profile,
          posts,
          newWeekStart,
        );
      } else {
        await processUserWeeklyResetWithoutPosts(ctx, profile, newWeekStart);
      }

      result.processedUsers++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`User ${profile.id}: ${errorMessage}`);
      result.success = false;
      ctx.logger.error(
        "Failed to process user",
        { userProfileId: profile.id },
        error as Error,
      );
    }
  }

  ctx.logger.info("Completed weekly-reset", {
    processedUsers: result.processedUsers,
    skippedUsers: result.skippedUsers,
    errorCount: result.errors.length,
  });

  return result;
};
