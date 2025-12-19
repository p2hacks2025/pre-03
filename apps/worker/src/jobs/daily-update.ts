import type { WorkerContext } from "@/lib";
import {
  fetchUserPostsByDate,
  getJstYesterday,
  getWeekStartDate,
  processUserDailyUpdate,
} from "@/tasks";

export type DailyUpdateResult = {
  success: boolean;
  targetDate: string;
  weekStartDate: string;
  processedUsers: number;
  errors: string[];
};

export const dailyUpdate = async (
  ctx: WorkerContext,
): Promise<DailyUpdateResult> => {
  const targetDateStr = process.env.TARGET_DATE;
  const targetDate = targetDateStr
    ? (() => {
        const date = new Date(targetDateStr);
        if (Number.isNaN(date.getTime())) {
          throw new Error(`Invalid TARGET_DATE format: ${targetDateStr}`);
        }
        return date;
      })()
    : getJstYesterday();
  const weekStartDate = getWeekStartDate(targetDate);

  ctx.logger.info("Starting daily-update", {
    targetDate: targetDate.toISOString().split("T")[0],
    weekStartDate: weekStartDate.toISOString().split("T")[0],
  });

  const result: DailyUpdateResult = {
    success: true,
    targetDate: targetDate.toISOString().split("T")[0],
    weekStartDate: weekStartDate.toISOString().split("T")[0],
    processedUsers: 0,
    errors: [],
  };

  const userPostsGroups = await fetchUserPostsByDate(ctx, targetDate);

  if (userPostsGroups.length === 0) {
    ctx.logger.info("No posts yesterday, skipping");
    return result;
  }

  for (const group of userPostsGroups) {
    try {
      await processUserDailyUpdate(ctx, group, targetDate, weekStartDate);
      result.processedUsers++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`User ${group.userProfileId}: ${errorMessage}`);
      result.success = false;
      ctx.logger.error(
        "Failed to process user",
        { userProfileId: group.userProfileId },
        error as Error,
      );
    }
  }

  ctx.logger.info("Completed daily-update", {
    processedUsers: result.processedUsers,
    errorCount: result.errors.length,
  });

  return result;
};
