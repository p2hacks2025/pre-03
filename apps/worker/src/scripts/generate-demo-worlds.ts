/**
 * デモユーザーのweekly_worldsを生成するスクリプト
 *
 * 実行方法:
 *   pnpm worker script src/scripts/generate-demo-worlds.ts
 *
 * 処理フロー:
 * 1. デモユーザーのuser_postsを取得
 * 2. 週ごとにグループ化
 * 3. 各週について:
 *    - weekly-reset: 前週の投稿からワールドを初期化（2回画像生成）
 *    - daily-update: 当週の各日の投稿で画像を更新
 */

import {
  and,
  authUsers,
  eq,
  isNull,
  userPosts,
  userProfiles,
} from "@packages/db";
import {
  createOrUpdateWorldBuildLog,
  createWeeklyWorld,
  findWeeklyWorld,
  getBaseImageBase64,
  getBaseImageBuffer,
  getContext,
  selectFieldId,
  updateWeeklyWorldImage,
  uploadGeneratedImage,
  type WorkerContext,
} from "@/lib";
import {
  fetchImageAsBase64,
  generateImage,
  generateSceneDescription,
  getWeekStartDate,
} from "@/tasks/daily-update";
import { selectRandomFieldIds } from "@/tasks/weekly-reset";

const DEMO_USER_EMAIL = "demo@example.com";
const API_DELAY_MS = 5000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type PostsByWeek = Map<
  string,
  { weekStartDate: Date; posts: (typeof userPosts.$inferSelect)[] }
>;

/**
 * デモユーザーのプロフィールIDを取得
 */
const getDemoUserProfileId = async (ctx: WorkerContext): Promise<string> => {
  const authUser = await ctx.db
    .select()
    .from(authUsers)
    .where(eq(authUsers.email, DEMO_USER_EMAIL))
    .limit(1);

  if (authUser.length === 0) {
    throw new Error(`Demo user not found: ${DEMO_USER_EMAIL}`);
  }

  const profile = await ctx.db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, authUser[0].id))
    .limit(1);

  if (profile.length === 0) {
    throw new Error(`Demo user profile not found for user: ${authUser[0].id}`);
  }

  return profile[0].id;
};

/**
 * デモユーザーの投稿を週ごとにグループ化
 */
const getPostsGroupedByWeek = async (
  ctx: WorkerContext,
  userProfileId: string,
): Promise<PostsByWeek> => {
  const posts = await ctx.db
    .select()
    .from(userPosts)
    .where(
      and(
        eq(userPosts.userProfileId, userProfileId),
        isNull(userPosts.deletedAt),
      ),
    )
    .orderBy(userPosts.createdAt);

  const grouped: PostsByWeek = new Map();

  for (const post of posts) {
    const createdAt = new Date(post.createdAt);
    const weekStartDate = getWeekStartDate(createdAt);
    const weekKey = weekStartDate.toISOString().split("T")[0];

    if (!grouped.has(weekKey)) {
      grouped.set(weekKey, { weekStartDate, posts: [] });
    }
    grouped.get(weekKey)?.posts.push(post);
  }

  return grouped;
};

/**
 * weekly-reset: 前週の投稿から新しい週のワールドを初期化
 * - 前週の投稿がある場合: シーン記述を生成し、2回画像生成
 * - 前週の投稿がない場合: ベース画像でワールドを作成
 */
const processWeeklyReset = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
  prevWeekPosts: (typeof userPosts.$inferSelect)[],
): Promise<{
  id: string;
  weeklyWorldImageUrl: string;
}> => {
  const weekStr = weekStartDate.toISOString().split("T")[0];
  ctx.logger.info(`[weekly-reset] Processing week: ${weekStr}`, {
    prevWeekPostCount: prevWeekPosts.length,
  });

  // 既存のweekly_worldを確認
  const existingWorld = await findWeeklyWorld(
    ctx,
    userProfileId,
    weekStartDate,
  );
  if (existingWorld) {
    ctx.logger.info("[weekly-reset] Weekly world already exists, skipping", {
      weekStartDate: weekStr,
    });
    return existingWorld;
  }

  // 前週の投稿がない場合: ベース画像でワールドを作成
  if (prevWeekPosts.length === 0) {
    ctx.logger.info("[weekly-reset] No previous week posts, using base image");
    const initialImageUrl = await uploadGeneratedImage(
      ctx,
      userProfileId,
      weekStartDate,
      getBaseImageBuffer(),
    );
    const weeklyWorld = await createWeeklyWorld(
      ctx,
      userProfileId,
      weekStartDate,
      initialImageUrl,
    );
    return weeklyWorld;
  }

  // 前週の投稿がある場合: シーン記述を生成し、2回画像生成
  const diaryContent = prevWeekPosts
    .map((post) => post.content)
    .join("\n\n---\n\n");
  const sceneDescription = await generateSceneDescription(ctx, diaryContent);
  ctx.logger.info("[weekly-reset] Generated scene description", {
    sceneDescription,
  });

  await sleep(API_DELAY_MS);

  const fieldIds = selectRandomFieldIds(2);
  let currentImageBase64 = getBaseImageBase64();

  // 1回目の画像生成
  ctx.logger.info("[weekly-reset] Generating first image", {
    fieldId: fieldIds[0],
  });
  const firstImageBuffer = await generateImage(
    ctx,
    currentImageBase64,
    fieldIds[0],
    sceneDescription,
  );

  const firstImageUrl = await uploadGeneratedImage(
    ctx,
    userProfileId,
    weekStartDate,
    firstImageBuffer,
  );
  currentImageBase64 = await fetchImageAsBase64(firstImageUrl);

  await sleep(API_DELAY_MS);

  // 2回目の画像生成
  ctx.logger.info("[weekly-reset] Generating second image", {
    fieldId: fieldIds[1],
  });
  const secondImageBuffer = await generateImage(
    ctx,
    currentImageBase64,
    fieldIds[1],
    sceneDescription,
  );

  const initialImageUrl = await uploadGeneratedImage(
    ctx,
    userProfileId,
    weekStartDate,
    secondImageBuffer,
  );

  // weekly_worldを作成
  const weeklyWorld = await createWeeklyWorld(
    ctx,
    userProfileId,
    weekStartDate,
    initialImageUrl,
  );

  // world_build_logを作成
  const today = new Date();
  for (const fieldId of fieldIds) {
    await createOrUpdateWorldBuildLog(
      ctx,
      weeklyWorld.id,
      fieldId,
      today,
      false,
    );
  }

  ctx.logger.info("[weekly-reset] Completed", { weekStartDate: weekStr });
  return weeklyWorld;
};

/**
 * daily-update: 当週の各日の投稿で画像を更新
 */
const processDailyUpdates = async (
  ctx: WorkerContext,
  userProfileId: string,
  weeklyWorld: { id: string; weeklyWorldImageUrl: string },
  posts: (typeof userPosts.$inferSelect)[],
): Promise<void> => {
  // 投稿を日ごとにグループ化
  const postsByDate = new Map<string, (typeof userPosts.$inferSelect)[]>();
  for (const post of posts) {
    const dateKey = new Date(post.createdAt).toISOString().split("T")[0];
    if (!postsByDate.has(dateKey)) {
      postsByDate.set(dateKey, []);
    }
    postsByDate.get(dateKey)?.push(post);
  }

  let currentImageUrl = weeklyWorld.weeklyWorldImageUrl;

  for (const [dateStr, datePosts] of postsByDate) {
    ctx.logger.info(`[daily-update] Processing date: ${dateStr}`, {
      postCount: datePosts.length,
    });

    // フィールドIDを選択
    const { fieldId, isOverwrite } = await selectFieldId(ctx, weeklyWorld.id);
    ctx.logger.info("[daily-update] Selected fieldId", {
      fieldId,
      isOverwrite,
    });

    // 日記内容を結合
    const diaryContent = datePosts.map((p) => p.content).join("\n\n");

    // シーン記述を生成（OpenAI）
    const sceneDescription = await generateSceneDescription(ctx, diaryContent);
    ctx.logger.info("[daily-update] Generated scene description", {
      sceneDescription,
    });

    await sleep(API_DELAY_MS);

    // 現在の画像を取得
    const currentImageBase64 = await fetchImageAsBase64(currentImageUrl);

    // 画像を生成（Gemini）
    const imageBuffer = await generateImage(
      ctx,
      currentImageBase64,
      fieldId,
      sceneDescription,
    );
    ctx.logger.info("[daily-update] Generated image");

    await sleep(API_DELAY_MS);

    // 画像をアップロード
    const weekStartDate = getWeekStartDate(new Date(dateStr));
    const newImageUrl = await uploadGeneratedImage(
      ctx,
      userProfileId,
      weekStartDate,
      imageBuffer,
    );

    // weekly_worldを更新
    await updateWeeklyWorldImage(ctx, weeklyWorld.id, newImageUrl);
    currentImageUrl = newImageUrl;

    // world_build_logを作成
    const targetDate = new Date(dateStr);
    await createOrUpdateWorldBuildLog(
      ctx,
      weeklyWorld.id,
      fieldId,
      targetDate,
      isOverwrite,
    );

    ctx.logger.info(`[daily-update] Completed processing for ${dateStr}`);
  }
};

const main = async () => {
  const ctx = getContext();
  ctx.logger.info("Starting demo worlds generation");

  try {
    // デモユーザーのプロフィールIDを取得
    const userProfileId = await getDemoUserProfileId(ctx);
    ctx.logger.info("Found demo user", { userProfileId });

    // 投稿を週ごとにグループ化
    const postsByWeek = await getPostsGroupedByWeek(ctx, userProfileId);
    ctx.logger.info(`Found ${postsByWeek.size} weeks with posts`);

    // 週を時系列順にソート
    const sortedWeeks = Array.from(postsByWeek.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    let prevWeekPosts: (typeof userPosts.$inferSelect)[] = [];

    // 各週を処理
    for (const [weekKey, { weekStartDate, posts }] of sortedWeeks) {
      try {
        ctx.logger.info(`\n${"=".repeat(50)}`);
        ctx.logger.info(`Processing week: ${weekKey}`);
        ctx.logger.info(`${"=".repeat(50)}`);

        // Step 1: weekly-reset（前週の投稿からワールドを初期化）
        const weeklyWorld = await processWeeklyReset(
          ctx,
          userProfileId,
          weekStartDate,
          prevWeekPosts,
        );

        // Step 2: daily-update（当週の各日の投稿で画像を更新）
        await processDailyUpdates(ctx, userProfileId, weeklyWorld, posts);

        // 次の週のために現在の週の投稿を保存
        prevWeekPosts = posts;

        ctx.logger.info(`Completed week: ${weekKey}`);
      } catch (error) {
        ctx.logger.error(
          `Failed to process week ${weekKey}`,
          {},
          error as Error,
        );
      }
    }

    ctx.logger.info("Demo worlds generation completed");
  } catch (error) {
    ctx.logger.error("Demo worlds generation failed", {}, error as Error);
    process.exit(1);
  }

  process.exit(0);
};

await main();
