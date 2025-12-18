import {
  createAiPost,
  getRandomAiProfile,
  getRandomHistoricalPosts,
  type WorkerContext,
} from "@/lib";
import {
  AI_POST_CONFIG,
  determineStandalonePostCount,
  generateAiPostContent,
  generateStandalonePosts,
  getRandomScheduledAt,
} from "@/tasks";

export type AiPostLongTermJobResult = {
  success: boolean;
  generatedPosts: number;
  standaloneGenerated: number;
  errors: string[];
};

export const aiPostLongTerm = async (
  ctx: WorkerContext,
): Promise<AiPostLongTermJobResult> => {
  ctx.logger.info("Starting ai-post-long-term job");

  const result: AiPostLongTermJobResult = {
    success: true,
    generatedPosts: 0,
    standaloneGenerated: 0,
    errors: [],
  };

  try {
    const diaries = await getRandomHistoricalPosts(
      ctx,
      AI_POST_CONFIG.LONG_TERM_FETCH_COUNT,
      AI_POST_CONFIG.LONG_TERM_EXCLUDE_DAYS,
    );

    if (diaries.length === 0) {
      ctx.logger.info(
        "No historical diaries found, generating standalone posts",
      );
      const postCount = determineStandalonePostCount(true);
      const standalone = await generateStandalonePosts(
        ctx,
        postCount,
        AI_POST_CONFIG.LONG_TERM_SCHEDULE_MIN,
        AI_POST_CONFIG.LONG_TERM_SCHEDULE_MAX,
      );
      result.standaloneGenerated = standalone.generated;
      result.errors.push(...standalone.errors);
      result.success = standalone.errors.length === 0;
      return result;
    }

    for (const diary of diaries) {
      try {
        const aiProfile = await getRandomAiProfile(ctx);
        const content = await generateAiPostContent(
          ctx,
          aiProfile,
          diary.content,
        );
        const sourceDate = new Date(diary.createdAt);

        await createAiPost(ctx, {
          aiProfileId: aiProfile.id,
          userProfileId: diary.userProfileId,
          content,
          sourceStartAt: sourceDate,
          sourceEndAt: sourceDate,
          scheduledAt: getRandomScheduledAt(
            AI_POST_CONFIG.LONG_TERM_SCHEDULE_MIN,
            AI_POST_CONFIG.LONG_TERM_SCHEDULE_MAX,
          ),
        });
        result.generatedPosts++;
      } catch (error) {
        result.errors.push(`Diary ${diary.id}: ${(error as Error).message}`);
        result.success = false;
        ctx.logger.error(
          "Failed to process diary",
          { diaryId: diary.id },
          error as Error,
        );
      }
    }

    ctx.logger.info("ai-post-long-term job completed", {
      generatedPosts: result.generatedPosts,
      standaloneGenerated: result.standaloneGenerated,
    });
    return result;
  } catch (error) {
    ctx.logger.error("ai-post-long-term job failed", {}, error as Error);
    result.success = false;
    return result;
  }
};
