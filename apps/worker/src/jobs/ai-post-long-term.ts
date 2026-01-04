import { countRecentAiPostsForUsers, type WorkerContext } from "@/lib";
import {
  AI_POST_CONFIG,
  fetchRandomHistoricalPostsForUsers,
  fetchUserIdsWithHistoricalPosts,
  processHistoricalAiPost,
  shouldExecuteWithChance,
} from "@/tasks";

export type AiPostLongTermJobResult = {
  success: boolean;
  skipped: boolean;
  processedUsers: number;
  generatedPosts: number;
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
      processedUsers: 0,
      generatedPosts: 0,
      errors: [],
    };
  }

  const result: AiPostLongTermJobResult = {
    success: true,
    skipped: false,
    processedUsers: 0,
    generatedPosts: 0,
    errors: [],
  };

  try {
    // 過去投稿があるユーザーIDのリストを取得
    const userIds = await fetchUserIdsWithHistoricalPosts(
      ctx,
      AI_POST_CONFIG.LONG_TERM_EXCLUDE_DAYS,
    );

    ctx.logger.info("Fetched users with historical posts", {
      userCount: userIds.length,
    });

    const recentCountMap = await countRecentAiPostsForUsers(
      ctx,
      userIds,
      AI_POST_CONFIG.FREQUENCY_CHECK_WINDOW_MINUTES,
    );

    const eligibleUserIds: string[] = [];
    for (const userProfileId of userIds) {
      // ユーザーごとの頻度チェック
      const userRecentCount = recentCountMap.get(userProfileId) ?? 0;
      if (userRecentCount >= AI_POST_CONFIG.MAX_POSTS_PER_HOUR) {
        ctx.logger.debug("Skipping user: over per-user limit", {
          userProfileId,
          recentCount: userRecentCount,
        });
        continue;
      }

      // ユーザーごとに50%確率判定
      if (!shouldExecuteWithChance(AI_POST_CONFIG.LONG_TERM_USER_CHANCE)) {
        continue;
      }

      eligibleUserIds.push(userProfileId);
    }

    ctx.logger.info("Eligible users after probability check", {
      eligibleCount: eligibleUserIds.length,
      totalCount: userIds.length,
    });

    if (eligibleUserIds.length === 0) {
      ctx.logger.info("ai-post-long-term job completed (no eligible users)", {
        processedUsers: 0,
        generatedPosts: 0,
      });
      return result;
    }

    const postsMap = await fetchRandomHistoricalPostsForUsers(
      ctx,
      eligibleUserIds,
      AI_POST_CONFIG.LONG_TERM_EXCLUDE_DAYS,
      AI_POST_CONFIG.LONG_TERM_POSTS_PER_USER,
    );

    for (const userProfileId of eligibleUserIds) {
      const posts = postsMap.get(userProfileId) ?? [];

      if (posts.length === 0) {
        continue;
      }

      ctx.logger.info("Processing user historical posts", {
        userProfileId,
        postCount: posts.length,
      });

      // 各投稿に対してAI投稿生成
      for (const post of posts) {
        try {
          const { generated } = await processHistoricalAiPost(
            ctx,
            post,
            AI_POST_CONFIG.LONG_TERM_SCHEDULE_MIN,
            AI_POST_CONFIG.LONG_TERM_SCHEDULE_MAX,
          );
          result.generatedPosts += generated;
        } catch (error) {
          result.errors.push(`Post ${post.id}: ${(error as Error).message}`);
          result.success = false;
          ctx.logger.error(
            "Failed to process post",
            { postId: post.id, userProfileId },
            error as Error,
          );
        }
      }
      result.processedUsers++;
    }

    ctx.logger.info("ai-post-long-term job completed", {
      processedUsers: result.processedUsers,
      generatedPosts: result.generatedPosts,
    });
    return result;
  } catch (error) {
    ctx.logger.error("ai-post-long-term job failed", {}, error as Error);
    result.success = false;
    return result;
  }
};
