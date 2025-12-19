import type { WorkerContext } from "@/lib";
import {
  AI_POST_CONFIG,
  fetchRecentUserPosts,
  generateStandalonePosts,
  groupPostsByUser,
  processUserAiPosts,
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
    const posts = await fetchRecentUserPosts(
      ctx,
      AI_POST_CONFIG.SHORT_TERM_MINUTES,
    );
    const groups = groupPostsByUser(posts);

    for (const group of groups) {
      try {
        const { generated } = await processUserAiPosts(
          ctx,
          group,
          AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MIN,
          AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MAX,
        );
        result.generatedPosts += generated;
        if (generated > 0) {
          result.processedUsers++;
        }
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
