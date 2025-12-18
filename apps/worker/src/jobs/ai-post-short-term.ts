import {
  createAiPost,
  getRandomAiProfile,
  getRecentUserPosts,
  hasExistingAiPost,
  type WorkerContext,
} from "@/lib";
import {
  AI_POST_CONFIG,
  determinePostCount,
  determineStandalonePostCount,
  generateAiPostContent,
  generateStandalonePosts,
  getRandomScheduledAt,
  groupPostsByUser,
} from "@/tasks";

export type AiPostShortTermJobResult = {
  success: boolean;
  processedUsers: number;
  generatedPosts: number;
  standaloneGenerated: number;
  errors: string[];
};

export const aiPostShortTerm = async (
  ctx: WorkerContext,
): Promise<AiPostShortTermJobResult> => {
  ctx.logger.info("Starting ai-post-short-term job");

  const result: AiPostShortTermJobResult = {
    success: true,
    processedUsers: 0,
    generatedPosts: 0,
    standaloneGenerated: 0,
    errors: [],
  };

  try {
    const posts = await getRecentUserPosts(
      ctx,
      AI_POST_CONFIG.SHORT_TERM_MINUTES,
    );
    const groups = groupPostsByUser(posts);

    if (groups.length === 0) {
      ctx.logger.info("No recent diaries found, generating standalone posts");
      const postCount = determineStandalonePostCount(false);
      const standalone = await generateStandalonePosts(
        ctx,
        postCount,
        AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MIN,
        AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MAX,
      );
      result.standaloneGenerated = standalone.generated;
      result.errors.push(...standalone.errors);
      result.success = standalone.errors.length === 0;
      return result;
    }

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

        const postCount = determinePostCount(diaryContent.length);
        for (let i = 0; i < postCount; i++) {
          const aiProfile = await getRandomAiProfile(ctx);
          const content = await generateAiPostContent(
            ctx,
            aiProfile,
            diaryContent,
          );
          await createAiPost(ctx, {
            aiProfileId: aiProfile.id,
            userProfileId: group.userProfileId,
            content,
            sourceStartAt,
            sourceEndAt,
            scheduledAt: getRandomScheduledAt(
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
