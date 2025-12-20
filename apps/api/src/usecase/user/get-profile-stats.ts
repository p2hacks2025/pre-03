import type { DbClient } from "@packages/db";
import type { GetProfileStatsOutput } from "@packages/schema/user";
import {
  countUserPosts,
  getPostingDatesForStreak,
} from "@/repository/user-post";
import { countWeeklyWorlds } from "@/repository/weekly-world";
import { getJSTTodayString } from "@/shared/date";

type GetProfileStatsDeps = {
  db: DbClient;
};

type GetProfileStatsInput = {
  profileId: string;
};

/**
 * 連続投稿日数を計算
 *
 * @param postingDates - 投稿日の配列（新しい順、"YYYY-MM-DD"形式）
 * @param jstToday - 今日の日付（JST、"YYYY-MM-DD"形式）
 * @returns 連続投稿日数
 */
const calculateStreak = (postingDates: string[], jstToday: string): number => {
  if (postingDates.length === 0) return 0;

  // 今日投稿があるかチェック
  const hasPostToday = postingDates[0] === jstToday;

  // 開始日を決定（今日投稿なければ昨日から）
  const checkDate = new Date(`${jstToday}T00:00:00Z`);
  if (!hasPostToday) {
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
  }

  let streak = 0;
  const dateSet = new Set(postingDates);

  // 連続している日数をカウント
  while (true) {
    const dateStr = formatDateForStreak(checkDate);
    if (dateSet.has(dateStr)) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * 日付を "YYYY-MM-DD" 形式にフォーマット
 */
const formatDateForStreak = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * プロフィール統計情報を取得
 */
export const getProfileStats = async (
  deps: GetProfileStatsDeps,
  input: GetProfileStatsInput,
): Promise<GetProfileStatsOutput> => {
  const { db } = deps;
  const { profileId } = input;

  // 並行実行で効率化
  const [totalPosts, worldCount, postingDates] = await Promise.all([
    countUserPosts(db, profileId),
    countWeeklyWorlds(db, profileId),
    getPostingDatesForStreak(db, { profileId }),
  ]);

  const jstToday = getJSTTodayString();
  const streakDays = calculateStreak(postingDates, jstToday);

  return {
    totalPosts,
    worldCount,
    streakDays,
  };
};
