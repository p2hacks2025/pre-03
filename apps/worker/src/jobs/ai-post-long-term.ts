import {
  createAiPost,
  getRandomAiProfile,
  getRandomHistoricalPosts,
  type WorkerContext,
} from "@/lib";
import {
  AI_POST_CONFIG,
  generateAiPostContents,
  generateStandalonePosts,
  getRandomPublishedAt,
  shouldExecuteWithChance,
} from "@/tasks";

export type AiPostLongTermJobResult = {
  success: boolean;
  skipped: boolean;
  generatedPosts: number;
  standaloneGenerated: number;
  errors: string[];
};

export const aiPostLongTerm = async (
  ctx: WorkerContext,
): Promise<AiPostLongTermJobResult> => {
  ctx.logger.info("Starting ai-post-long-term job");

  // Probability check (50%)
  if (!shouldExecuteWithChance(AI_POST_CONFIG.LONG_TERM_POST_CHANCE)) {
    ctx.logger.info("Skipping ai-post-long-term job due to probability check");
    return {
      success: true,
      skipped: true,
      generatedPosts: 0,
      standaloneGenerated: 0,
      errors: [],
    };
  }

  const result: AiPostLongTermJobResult = {
    success: true,
    skipped: false,
    generatedPosts: 0,
    standaloneGenerated: 0,
    errors: [],
  };

  try {
    // Always generate standalone posts
    const standalone = await generateStandalonePosts(
      ctx,
      AI_POST_CONFIG.LONG_TERM_SCHEDULE_MIN,
      AI_POST_CONFIG.LONG_TERM_SCHEDULE_MAX,
    );
    result.standaloneGenerated = standalone.generated;
    result.errors.push(...standalone.errors);

    // Process historical diaries
    const diaries = await getRandomHistoricalPosts(
      ctx,
      AI_POST_CONFIG.LONG_TERM_FETCH_COUNT,
      AI_POST_CONFIG.LONG_TERM_EXCLUDE_DAYS,
    );

    for (const diary of diaries) {
      try {
        const aiProfile = await getRandomAiProfile(ctx);
        const contents = await generateAiPostContents(
          ctx,
          aiProfile,
          diary.content,
          AI_POST_CONFIG.POSTS_PER_USER,
        );
        const sourceDate = new Date(diary.createdAt);

        for (const content of contents) {
          await createAiPost(ctx, {
            aiProfileId: aiProfile.id,
            userProfileId: diary.userProfileId,
            content,
            sourceStartAt: sourceDate,
            sourceEndAt: sourceDate,
            publishedAt: getRandomPublishedAt(
              AI_POST_CONFIG.LONG_TERM_SCHEDULE_MIN,
              AI_POST_CONFIG.LONG_TERM_SCHEDULE_MAX,
            ),
          });
          result.generatedPosts++;
        }
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

    if (standalone.errors.length > 0) {
      result.success = false;
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
