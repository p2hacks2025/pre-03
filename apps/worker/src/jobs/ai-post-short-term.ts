import { countRecentAiPosts, type WorkerContext } from "@/lib";
import {
  AI_POST_CONFIG,
  calculateUserChance,
  fetchRecentUserPosts,
  generateStandalonePosts,
  groupPostsByUser,
  processUserAiPosts,
  shouldExecuteWithChance,
  TIME_WINDOWS,
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

    // スタンドアロン投稿を生成（2%確率）
    if (shouldExecuteWithChance(AI_POST_CONFIG.SHORT_TERM_POST_CHANCE)) {
      const standalone = await generateStandalonePosts(
        ctx,
        AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MIN,
        AI_POST_CONFIG.SHORT_TERM_SCHEDULE_MAX,
      );
      result.standaloneGenerated = standalone.generated;
      result.errors.push(...standalone.errors);
    }

    // 24時間分のポストを1回で取得（DBアクセス最適化）
    const maxMinutes = TIME_WINDOWS[TIME_WINDOWS.length - 1].minutes; // 1440分
    const allPosts = await fetchRecentUserPosts(ctx, maxMinutes);
    const now = Date.now();

    // 全ユーザーをグループ化
    const allGroups = groupPostsByUser(allPosts);

    ctx.logger.info("Fetched all posts for processing", {
      totalPosts: allPosts.length,
      userCount: allGroups.length,
      maxMinutes,
    });

    // ユーザーごとにループ（フォールバック方式）
    for (const userGroup of allGroups) {
      // 残り枠チェック
      const currentRemaining =
        AI_POST_CONFIG.MAX_POSTS_PER_HOUR -
        (await countRecentAiPosts(
          ctx,
          AI_POST_CONFIG.FREQUENCY_CHECK_WINDOW_MINUTES,
        ));
      if (currentRemaining <= 0) {
        ctx.logger.info("Stopping: over upper limit during processing");
        break;
      }

      // 時間範囲を短い順にチェック（フォールバック）
      for (const window of TIME_WINDOWS) {
        const cutoff = now - window.minutes * 60 * 1000;
        const postsInWindow = userGroup.posts.filter(
          (p) => new Date(p.createdAt).getTime() >= cutoff,
        );

        // この時間範囲に投稿がなければ次の範囲へ
        if (postsInWindow.length === 0) continue;

        // 投稿があれば確率判定
        const chance = calculateUserChance(postsInWindow.length, window);
        if (!shouldExecuteWithChance(chance)) break; // 判定失敗でも終了

        ctx.logger.info("User selected for AI response", {
          userProfileId: userGroup.userProfileId,
          postCount: postsInWindow.length,
          chance,
          windowMinutes: window.minutes,
        });

        try {
          const group = {
            userProfileId: userGroup.userProfileId,
            posts: postsInWindow,
          };
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
            `User ${userGroup.userProfileId}: ${(error as Error).message}`,
          );
          result.success = false;
          ctx.logger.error(
            "Failed to process user",
            { userProfileId: userGroup.userProfileId },
            error as Error,
          );
        }
        break; // 1ユーザー1回で終了（フォールバック）
      }
    }

    if (result.errors.length > 0) {
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
