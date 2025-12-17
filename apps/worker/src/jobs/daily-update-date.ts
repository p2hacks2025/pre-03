import {
  createOrUpdateWorldBuildLog,
  getUserPostsByDate,
  getWeeklyWorld,
  selectFieldId,
  updateWeeklyWorldImage,
  uploadGeneratedImage,
  type WorkerContext,
} from "@/lib";
import { fetchImageAsBase64, generateImage, getWeekStartDate } from "@/tasks";

export type DailyUpdateDateResult = {
  success: boolean;
  targetDate: string;
  weekStartDate: string;
  processedUsers: number;
  errors: string[];
};

export const dailyUpdateDate = async (
  ctx: WorkerContext,
): Promise<DailyUpdateDateResult> => {
  const targetDateStr = process.env.TARGET_DATE;
  if (!targetDateStr) {
    throw new Error("TARGET_DATE environment variable is required");
  }

  const targetDate = new Date(targetDateStr);
  if (Number.isNaN(targetDate.getTime())) {
    throw new Error(`Invalid date format: ${targetDateStr}`);
  }

  const weekStartDate = getWeekStartDate(targetDate);

  ctx.logger.info("Starting daily-update-date", {
    targetDate: targetDate.toISOString().split("T")[0],
    weekStartDate: weekStartDate.toISOString().split("T")[0],
  });

  const result: DailyUpdateDateResult = {
    success: true,
    targetDate: targetDate.toISOString().split("T")[0],
    weekStartDate: weekStartDate.toISOString().split("T")[0],
    processedUsers: 0,
    errors: [],
  };

  const userPostsGroups = await getUserPostsByDate(ctx, targetDate);

  if (userPostsGroups.length === 0) {
    ctx.logger.info("No posts for target date, skipping");
    return result;
  }

  for (const group of userPostsGroups) {
    try {
      const weeklyWorld = await getWeeklyWorld(
        ctx,
        group.userProfileId,
        weekStartDate,
      );

      const { fieldId, isOverwrite } = await selectFieldId(ctx, weeklyWorld.id);
      ctx.logger.info("Selected fieldId", { fieldId, isOverwrite });

      const diaryContent = group.posts.map((p) => p.content).join("\n\n");
      const currentImageBase64 = await fetchImageAsBase64(
        weeklyWorld.weeklyWorldImageUrl,
      );

      const imageBuffer = await generateImage(
        ctx,
        currentImageBase64,
        fieldId,
        diaryContent,
      );

      const newImageUrl = await uploadGeneratedImage(
        ctx,
        group.userProfileId,
        weekStartDate,
        imageBuffer,
      );

      await updateWeeklyWorldImage(ctx, weeklyWorld.id, newImageUrl);

      await createOrUpdateWorldBuildLog(
        ctx,
        weeklyWorld.id,
        fieldId,
        targetDate,
        isOverwrite,
      );

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

  ctx.logger.info("Completed daily-update-date", {
    processedUsers: result.processedUsers,
    errorCount: result.errors.length,
  });

  return result;
};
