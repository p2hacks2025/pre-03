import { countRecentAiPosts, type WorkerContext } from "@/lib";
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

  const result: AiPostShortTermJobResult = {
    success: true,
    skipped: false,
    processedUsers: 0,
    generatedPosts: 0,
    standaloneGenerated: 0,
    errors: [],
  };

  try {
    // 頻度制御: 直近1時間の投稿数をチェック
    const recentPostCount = await countRecentAiPosts(
      ctx,
      AI_POST_CONFIG.FREQUENCY_CHECK_WINDOW_MINUTES,
    );
    const remaining = AI_POST_CONFIG.MAX_POSTS_PER_HOUR - recentPostCount;

    ctx.logger.info("Frequency check", {
      recentPostCount,
      maxPerHour: AI_POST_CONFIG.MAX_POSTS_PER_HOUR,
      minPerHour: AI_POST_CONFIG.MIN_POSTS_PER_HOUR,
      remaining,
    });

    // 上限超過時はスキップ
    if (remaining <= 0) {
      ctx.logger.info("Skipping: over upper limit", { recentPostCount });
      return { ...result, skipped: true };
    }

    // 下限未満の場合は強制実行、それ以外は10%確率
    const isBelowMinimum = recentPostCount < AI_POST_CONFIG.MIN_POSTS_PER_HOUR;
    const shouldExecute =
      isBelowMinimum ||
      shouldExecuteWithChance(AI_POST_CONFIG.SHORT_TERM_POST_CHANCE);

    if (!shouldExecute) {
      ctx.logger.info("Skipping: probability check failed");
      return { ...result, skipped: true };
    }

    if (isBelowMinimum) {
      ctx.logger.info("Force execution: below minimum threshold");
    }

    // 残り枠が少ない場合は投稿数を動的に調整
    let effectivePostCount: number = AI_POST_CONFIG.POSTS_PER_USER;
    if (remaining < 3) {
      effectivePostCount = Math.floor(Math.random() * (remaining + 1));
      ctx.logger.info("Adjusted post count due to remaining capacity", {
        remaining,
        effectivePostCount,
      });
      if (effectivePostCount === 0) {
        return { ...result, skipped: true };
      }
    }

    // スタンドアロン投稿を生成
    const standalone = await generateStandalonePosts(
      ctx,
      AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MIN,
      AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MAX,
    );
    result.standaloneGenerated = standalone.generated;
    result.errors.push(...standalone.errors);

    // ユーザー投稿を処理
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
