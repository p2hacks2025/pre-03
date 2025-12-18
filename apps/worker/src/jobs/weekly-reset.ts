import {
  createOrUpdateWorldBuildLog,
  createWeeklyWorld,
  findWeeklyWorld,
  getAllUserProfiles,
  getBaseImageBase64,
  getBaseImageBuffer,
  getUserPostsForWeek,
  uploadGeneratedImage,
  type WorkerContext,
} from "@/lib";
import {
  fetchImageAsBase64,
  generateImage,
  getNextWeekStart,
  getTargetWeekStart,
  selectRandomFieldIds,
  summarizePostsWithLLM,
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

  const userProfiles = await getAllUserProfiles(ctx);

  if (userProfiles.length === 0) {
    ctx.logger.info("No active users, skipping");
    return result;
  }

  for (const profile of userProfiles) {
    try {
      const existingNewWeekWorld = await findWeeklyWorld(
        ctx,
        profile.id,
        newWeekStart,
      );
      if (existingNewWeekWorld) {
        result.skippedUsers++;
        continue;
      }

      const posts = await getUserPostsForWeek(ctx, profile.id, targetWeekStart);
      let initialImageUrl: string;

      if (posts.length > 0) {
        const summary = await summarizePostsWithLLM(ctx, posts);
        const fieldIds = selectRandomFieldIds(2);

        let currentImageBase64 = getBaseImageBase64();

        const firstImageBuffer = await generateImage(
          ctx,
          currentImageBase64,
          fieldIds[0],
          summary,
        );

        const firstImageUrl = await uploadGeneratedImage(
          ctx,
          profile.id,
          newWeekStart,
          firstImageBuffer,
        );
        currentImageBase64 = await fetchImageAsBase64(firstImageUrl);

        const secondImageBuffer = await generateImage(
          ctx,
          currentImageBase64,
          fieldIds[1],
          summary,
        );

        initialImageUrl = await uploadGeneratedImage(
          ctx,
          profile.id,
          newWeekStart,
          secondImageBuffer,
        );

        const newWeeklyWorld = await createWeeklyWorld(
          ctx,
          profile.id,
          newWeekStart,
          initialImageUrl,
        );

        const today = new Date();
        for (const fieldId of fieldIds) {
          await createOrUpdateWorldBuildLog(
            ctx,
            newWeeklyWorld.id,
            fieldId,
            today,
            false,
          );
        }
      } else {
        initialImageUrl = await uploadGeneratedImage(
          ctx,
          profile.id,
          newWeekStart,
          getBaseImageBuffer(),
        );

        await createWeeklyWorld(ctx, profile.id, newWeekStart, initialImageUrl);
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
