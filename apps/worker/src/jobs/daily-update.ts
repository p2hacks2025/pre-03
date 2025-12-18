import {
  createOrUpdateWorldBuildLog,
  getUserPostsByDate,
  getWeeklyWorld,
  selectFieldId,
  updateWeeklyWorldImage,
  uploadGeneratedImage,
  type WorkerContext,
} from "@/lib";
import {
  fetchImageAsBase64,
  generateImage,
  getJstYesterday,
  getWeekStartDate,
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

  const userPostsGroups = await getUserPostsByDate(ctx, targetDate);

  if (userPostsGroups.length === 0) {
    ctx.logger.info("No posts yesterday, skipping");
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

  ctx.logger.info("Completed daily-update", {
    processedUsers: result.processedUsers,
    errorCount: result.errors.length,
  });

  return result;
};
