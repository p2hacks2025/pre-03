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

  // 頻度制御: 過去1時間のAI投稿数をカウント
  const n = await countRecentAiPosts(
    ctx,
    AI_POST_CONFIG.FREQUENCY_CHECK_WINDOW_MINUTES,
  );
  const remaining = AI_POST_CONFIG.MAX_POSTS_PER_HOUR - n;

  ctx.logger.info("Frequency control check", {
    recentAiPosts: n,
    remaining,
    maxPerHour: AI_POST_CONFIG.MAX_POSTS_PER_HOUR,
    minPerHour: AI_POST_CONFIG.MIN_POSTS_PER_HOUR,
  });

  // 上限チェック: 5件以上ならスキップ
  if (remaining <= 0) {
    ctx.logger.info("Skipping: max posts per hour reached", { n });
    return {
      success: true,
      skipped: true,
      processedUsers: 0,
      generatedPosts: 0,
      standaloneGenerated: 0,
      errors: [],
    };
  }

  // 下限チェック: 0件なら強制実行（抽選スキップ）
  const forceExecute = n < AI_POST_CONFIG.MIN_POSTS_PER_HOUR;

  // 通常の10%抽選（下限未満の場合はスキップ）
  if (
    !forceExecute &&
    !shouldExecuteWithChance(AI_POST_CONFIG.SHORT_TERM_POST_CHANCE)
  ) {
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

  // 動的件数調整: remaining < 3 の場合、0〜remaining件からランダム選択
  if (remaining < 3) {
    const maxPostCount = Math.floor(Math.random() * (remaining + 1));
    if (maxPostCount === 0) {
      ctx.logger.info("Skipping: random post count is 0", { remaining });
      return {
        success: true,
        skipped: true,
        processedUsers: 0,
        generatedPosts: 0,
        standaloneGenerated: 0,
        errors: [],
      };
    }
    ctx.logger.info("Dynamic post count selected", { remaining, maxPostCount });
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
