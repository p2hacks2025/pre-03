import {
  createAiPost,
  getRandomAiProfile,
  getRecentUserPosts,
  hasExistingAiPost,
  type WorkerContext,
} from "@/lib";
import {
  AI_POST_CONFIG,
  generateAiPostContents,
  generateStandalonePosts,
  getRandomPublishedAt,
  groupPostsByUser,
  shouldExecuteWithChance,
} from "@/tasks";

export type AiPostShortTermJobResult = {
  success: boolean;
  skipped: boolean;
  processedUsers: number;
  generatedPosts: number;
  standaloneGenerated: number;
  errors: string[];
};

export const aiPostShortTerm = async (
  ctx: WorkerContext,
): Promise<AiPostShortTermJobResult> => {
  ctx.logger.info("Starting ai-post-short-term job");

  // Probability check (10%)
  if (!shouldExecuteWithChance(AI_POST_CONFIG.SHORT_TERM_POST_CHANCE)) {
    ctx.logger.info("Skipping ai-post-short-term job due to probability check");
    return {
      success: true,
      skipped: true,
      processedUsers: 0,
      generatedPosts: 0,
      standaloneGenerated: 0,
      errors: [],
    };
  }

  const result: AiPostShortTermJobResult = {
    success: true,
    skipped: false,
    processedUsers: 0,
    generatedPosts: 0,
    standaloneGenerated: 0,
    errors: [],
  };

  try {
    // Always generate standalone posts
    const standalone = await generateStandalonePosts(
      ctx,
      AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MIN,
      AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MAX,
    );
    result.standaloneGenerated = standalone.generated;
    result.errors.push(...standalone.errors);

    // Process user posts if any
    const posts = await getRecentUserPosts(
      ctx,
      AI_POST_CONFIG.SHORT_TERM_MINUTES,
    );
    const groups = groupPostsByUser(posts);

    for (const group of groups) {
      try {
        const diaryContent = group.posts.map((p) => p.content).join("\n\n");
        const sorted = [...group.posts].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        const sourceStartAt = new Date(sorted[0].createdAt);
        const sourceEndAt = new Date(sorted[sorted.length - 1].createdAt);

        if (
          await hasExistingAiPost(
            ctx,
            group.userProfileId,
            sourceStartAt,
            sourceEndAt,
          )
        ) {
          continue;
        }

        const aiProfile = await getRandomAiProfile(ctx);
        const contents = await generateAiPostContents(
          ctx,
          aiProfile,
          diaryContent,
          AI_POST_CONFIG.POSTS_PER_USER,
        );

        for (const content of contents) {
          await createAiPost(ctx, {
            aiProfileId: aiProfile.id,
            userProfileId: group.userProfileId,
            content,
            sourceStartAt,
            sourceEndAt,
            publishedAt: getRandomPublishedAt(
              AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MIN,
              AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MAX,
            ),
          });
          result.generatedPosts++;
        }
        result.processedUsers++;
      } catch (error) {
        result.errors.push(
          `User ${group.userProfileId}: ${(error as Error).message}`,
        );
        result.success = false;
        ctx.logger.error(
          "Failed to process user",
          { userProfileId: group.userProfileId },
          error as Error,
        );
      }
    }

    if (standalone.errors.length > 0) {
      result.success = false;
    }

    ctx.logger.info("ai-post-short-term job completed", {
      processedUsers: result.processedUsers,
      generatedPosts: result.generatedPosts,
      standaloneGenerated: result.standaloneGenerated,
    });
    return result;
  } catch (error) {
    ctx.logger.error("ai-post-short-term job failed", {}, error as Error);
    result.success = false;
    return result;
  }
};
