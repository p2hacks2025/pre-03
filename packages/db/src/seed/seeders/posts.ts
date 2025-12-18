import { faker } from "@faker-js/faker/locale/ja";
import { eq } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { userPosts, userProfiles } from "../../schema";
import type { Seeder } from "./index";

// 設定
const POST_COUNT = Number(process.env.SEED_POST_COUNT) || 100;
const IMAGE_PROBABILITY = 0.3; // 30%の確率で画像付与
const DATE_RANGE_DAYS = 30; // 過去30日間にランダム分散

// テスト対象ユーザー
const TEST_USER_EMAIL = "test@example.com";

/**
 * ランダムな過去の日時を生成
 */
const getRandomPastDate = (): Date => {
  const now = new Date();
  const daysAgo = Math.random() * DATE_RANGE_DAYS;
  const hoursAgo = Math.random() * 24;
  const minutesAgo = Math.random() * 60;

  return new Date(
    now.getTime() -
      daysAgo * 24 * 60 * 60 * 1000 -
      hoursAgo * 60 * 60 * 1000 -
      minutesAgo * 60 * 1000,
  );
};

/**
 * ランダムな画像URLを生成（picsum.photos使用）
 */
const getRandomImageUrl = (): string | null => {
  if (Math.random() > IMAGE_PROBABILITY) {
    return null;
  }
  const seed = faker.string.alphanumeric(10);
  return `https://picsum.photos/seed/${seed}/800/600`;
};

/**
 * 日記風のテキストを生成
 */
const generateDiaryContent = (): string => {
  const paragraphs = faker.lorem.paragraphs({ min: 1, max: 3 });
  return paragraphs;
};

export const postsSeeder: Seeder = {
  name: "posts",

  async reset(ctx) {
    console.log("  [posts] Resetting posts for test user...");

    // test@example.com のユーザーを取得
    const authUser = await ctx.db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, TEST_USER_EMAIL))
      .limit(1);

    if (authUser.length === 0) {
      console.log("  [posts] Test user not found, skipping reset");
      return;
    }

    // そのユーザーのプロフィールを取得
    const profile = await ctx.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, authUser[0].id))
      .limit(1);

    if (profile.length === 0) {
      console.log("  [posts] Profile not found, skipping reset");
      return;
    }

    // そのプロフィールの投稿を削除
    const deleted = await ctx.db
      .delete(userPosts)
      .where(eq(userPosts.userProfileId, profile[0].id))
      .returning();

    console.log(`  [posts] Deleted ${deleted.length} posts`);
  },

  async seed(ctx) {
    console.log(`  [posts] Seeding ${POST_COUNT} posts for test user...`);

    // test@example.com のユーザーを取得
    const authUser = await ctx.db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, TEST_USER_EMAIL))
      .limit(1);

    if (authUser.length === 0) {
      console.log("  [posts] Test user not found. Run users seeder first.");
      return;
    }

    // そのユーザーのプロフィールを取得
    const profile = await ctx.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, authUser[0].id))
      .limit(1);

    if (profile.length === 0) {
      console.log("  [posts] Profile not found. Run users seeder first.");
      return;
    }

    const profileId = profile[0].id;

    // 投稿データを生成
    const posts = Array.from({ length: POST_COUNT }, () => {
      const createdAt = getRandomPastDate();
      return {
        userProfileId: profileId,
        content: generateDiaryContent(),
        uploadImageUrl: getRandomImageUrl(),
        createdAt,
        updatedAt: createdAt,
      };
    });

    // createdAtでソート（新しい順）して挿入
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // bulk insert
    await ctx.db.insert(userPosts).values(posts);

    const withImage = posts.filter((p) => p.uploadImageUrl !== null).length;
    console.log(
      `  [posts] Created ${POST_COUNT} posts (${withImage} with images)`,
    );
  },
};
