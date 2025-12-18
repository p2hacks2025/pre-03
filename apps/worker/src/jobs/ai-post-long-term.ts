import {
  createAiPost,
  getRandomAiProfile,
  getRandomHistoricalPosts,
  type WorkerContext,
} from "@/lib";
import {
  generateAiPostContent,
  generateStandaloneAiPostContent,
  getRandomScheduledAt,
} from "@/tasks";

export type AiPostLongTermJobResult = {
  success: boolean;
  generatedPosts: number;
  standaloneGenerated: number;
  errors: string[];
};

const generateStandalonePosts = async (
  ctx: WorkerContext,
  result: AiPostLongTermJobResult,
): Promise<void> => {
  const postCount = Math.floor(Math.random() * 3) + 1;
  ctx.logger.info("Generating standalone AI posts", { postCount });

  for (let i = 0; i < postCount; i++) {
    try {
      const aiProfile = await getRandomAiProfile(ctx);
      const content = await generateStandaloneAiPostContent(ctx, aiProfile);
      const now = new Date();
      await createAiPost(ctx, {
        aiProfileId: aiProfile.id,
        userProfileId: null,
        content,
        sourceStartAt: now,
        sourceEndAt: now,
        scheduledAt: getRandomScheduledAt(60, 1440),
      });
      result.standaloneGenerated++;
    } catch (error) {
      result.errors.push(`Standalone: ${(error as Error).message}`);
      ctx.logger.error(
        "Failed to generate standalone post",
        {},
        error as Error,
      );
    }
  }
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
    const diaries = await getRandomHistoricalPosts(ctx, 10, 7);

    if (diaries.length === 0) {
      ctx.logger.info(
        "No historical diaries found, generating standalone posts",
      );
      await generateStandalonePosts(ctx, result);
      result.success = result.errors.length === 0;
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
          scheduledAt: getRandomScheduledAt(60, 1440),
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
    });
    return result;
  } catch (error) {
    ctx.logger.error("ai-post-long-term job failed", {}, error as Error);
    result.success = false;
    return result;
  }
};
