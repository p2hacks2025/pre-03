/**
 * デモユーザーの投稿に対するAI投稿を生成するスクリプト
 *
 * 実行方法:
 *   pnpm worker script generate-demo-ai-posts
 *
 * 処理フロー:
 * 1. デモユーザーのuser_postsを取得
 * 2. 各投稿についてAI投稿を生成
 * 3. ai_postsレコードを作成
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
  createAiPost,
  getContext,
  getRandomAiProfile,
  type WorkerContext,
} from "@/lib";
import { AI_POST_CONFIG, generateAiPostContents } from "@/tasks/ai-post";

const DEMO_USER_EMAIL = "demo@example.com";
const API_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
 * デモユーザーの全投稿を取得
 */
const getDemoUserPosts = async (
  ctx: WorkerContext,
  userProfileId: string,
): Promise<(typeof userPosts.$inferSelect)[]> => {
  return ctx.db
    .select()
    .from(userPosts)
    .where(
      and(
        eq(userPosts.userProfileId, userProfileId),
        isNull(userPosts.deletedAt),
      ),
    )
    .orderBy(userPosts.createdAt);
};

/**
 * 投稿に対するAI投稿を生成
 */
const processPost = async (
  ctx: WorkerContext,
  post: typeof userPosts.$inferSelect,
): Promise<number> => {
  const postDate = new Date(post.createdAt);
  ctx.logger.info(`Processing post: ${post.id}`, {
    date: postDate.toISOString().split("T")[0],
    contentPreview: post.content.slice(0, 50),
  });

  // ランダムなAIプロフィールを取得
  const aiProfile = await getRandomAiProfile(ctx);

  // AI投稿を生成
  const contents = await generateAiPostContents(
    ctx,
    aiProfile,
    post.content,
    AI_POST_CONFIG.POSTS_PER_USER,
  );

  let generated = 0;
  const sourceDate = new Date(post.createdAt);

  for (const content of contents) {
    // 投稿日の数分〜数時間後に公開されるように設定
    const publishedAt = new Date(
      sourceDate.getTime() +
        Math.floor(Math.random() * 60 * 60 * 1000) +
        5 * 60 * 1000,
    );

    await createAiPost(ctx, {
      aiProfileId: aiProfile.id,
      userProfileId: post.userProfileId,
      content,
      sourceStartAt: sourceDate,
      sourceEndAt: sourceDate,
      publishedAt,
    });

    generated++;
  }

  ctx.logger.info(`Generated ${generated} AI posts for post ${post.id}`);
  return generated;
};

const main = async () => {
  const ctx = getContext();
  ctx.logger.info("Starting demo AI posts generation");

  try {
    // デモユーザーのプロフィールIDを取得
    const userProfileId = await getDemoUserProfileId(ctx);
    ctx.logger.info("Found demo user", { userProfileId });

    // デモユーザーの投稿を取得
    const posts = await getDemoUserPosts(ctx, userProfileId);
    ctx.logger.info(`Found ${posts.length} posts`);

    // 各投稿を処理
    let totalGenerated = 0;
    for (const post of posts) {
      try {
        const generated = await processPost(ctx, post);
        totalGenerated += generated;

        // API rate limit対策
        await sleep(API_DELAY_MS);
      } catch (error) {
        ctx.logger.error(
          `Failed to process post ${post.id}`,
          {},
          error as Error,
        );
      }
    }

    ctx.logger.info("Demo AI posts generation completed", {
      totalPosts: posts.length,
      totalGenerated,
    });
  } catch (error) {
    ctx.logger.error("Demo AI posts generation failed", {}, error as Error);
    process.exit(1);
  }

  process.exit(0);
};

await main();
