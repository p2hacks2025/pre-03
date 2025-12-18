import { eq } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { userProfiles, weeklyWorlds } from "../../schema";
import type { Seeder } from "./index";

// 設定
const TEST_USER_EMAIL = "test@example.com";
const DATE_RANGE_DAYS = 30; // postsSeeder と同じ範囲
const WORLD_PROBABILITY = 0.7; // 70%の確率でワールド作成

/**
 * 指定日の週の開始日（月曜日）を取得
 */
const getWeekStartDate = (targetDate: Date): Date => {
  const dayOfWeek = targetDate.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate() - daysToMonday,
    ),
  );
};

/**
 * 過去N日間の週開始日リストを取得（重複なし）
 */
const getWeekStartDatesInRange = (days: number): Date[] => {
  const weekStarts = new Map<string, Date>();
  const now = new Date();

  for (let i = 0; i <= days; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const weekStart = getWeekStartDate(date);
    const key = weekStart.toISOString().split("T")[0];
    if (!weekStarts.has(key)) {
      weekStarts.set(key, weekStart);
    }
  }

  return Array.from(weekStarts.values()).sort(
    (a, b) => a.getTime() - b.getTime(),
  );
};

/**
 * ダミー画像URLを生成（picsum.photos使用）
 */
const getDummyImageUrl = (seed: string): string => {
  return `https://picsum.photos/seed/${seed}/800/600`;
};

export const testWeeklyWorldsSeeder: Seeder = {
  name: "test-weekly-worlds",

  async reset(ctx) {
    console.log("  [test-weekly-worlds] Resetting...");

    const testUser = await ctx.db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .innerJoin(authUsers, eq(authUsers.id, userProfiles.userId))
      .where(eq(authUsers.email, TEST_USER_EMAIL))
      .limit(1);

    if (testUser.length === 0) {
      console.log("  [test-weekly-worlds] Test user not found, skipping");
      return;
    }

    const deleted = await ctx.db
      .delete(weeklyWorlds)
      .where(eq(weeklyWorlds.userProfileId, testUser[0].id))
      .returning();

    console.log(`  [test-weekly-worlds] Deleted ${deleted.length} records`);
  },

  async seed(ctx) {
    console.log("  [test-weekly-worlds] Seeding...");

    const testUser = await ctx.db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .innerJoin(authUsers, eq(authUsers.id, userProfiles.userId))
      .where(eq(authUsers.email, TEST_USER_EMAIL))
      .limit(1);

    if (testUser.length === 0) {
      console.log("  [test-weekly-worlds] Test user not found, skipping");
      return;
    }

    const userProfileId = testUser[0].id;
    const weekStarts = getWeekStartDatesInRange(DATE_RANGE_DAYS);

    // 70%の確率でレコード作成
    const worldsToCreate = weekStarts
      .filter(() => Math.random() < WORLD_PROBABILITY)
      .map((weekStartDate) => {
        const seed = `world-${weekStartDate.toISOString().split("T")[0]}`;
        return {
          userProfileId,
          weekStartDate,
          weeklyWorldImageUrl: getDummyImageUrl(seed),
        };
      });

    if (worldsToCreate.length > 0) {
      await ctx.db.insert(weeklyWorlds).values(worldsToCreate);
    }

    console.log(
      `  [test-weekly-worlds] Created ${worldsToCreate.length}/${weekStarts.length} weekly worlds`,
    );
  },
};
