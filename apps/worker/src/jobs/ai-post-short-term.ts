import {
  createAiPost,
  getRandomAiProfile,
  getRecentUserPosts,
  hasExistingAiPost,
  type WorkerContext,
} from "@/lib";
import {
  determinePostCount,
  generateAiPostContent,
  generateStandaloneAiPostContent,
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

const generateStandalonePosts = async (
  ctx: WorkerContext,
  result: AiPostShortTermJobResult,
): Promise<void> => {
  const postCount = Math.random() < 0.5 ? 1 : 2;
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
        scheduledAt: getRandomScheduledAt(1, 30),
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
    const posts = await getRecentUserPosts(ctx, 30);
    const groups = groupPostsByUser(posts);

    if (groups.length === 0) {
      ctx.logger.info("No recent diaries found, generating standalone posts");
      await generateStandalonePosts(ctx, result);
      result.success = result.errors.length === 0;
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
            scheduledAt: getRandomScheduledAt(1, 30),
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
    });
    return result;
  } catch (error) {
    ctx.logger.error("ai-post-short-term job failed", {}, error as Error);
    result.success = false;
    return result;
  }
};
