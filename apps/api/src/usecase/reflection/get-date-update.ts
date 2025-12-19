import type { DbClient } from "@packages/db";
import type { GetDateUpdateOutput } from "@packages/schema/reflection";
import { getUserProfileByUserId } from "@/repository/user-profile";
import { getWeeklyWorldByWeekStart } from "@/repository/weekly-world";
import { getLatestBuildLogByProfileId } from "@/repository/world-build-log";
import {
  formatDateString,
  getJSTPreviousWeekStart,
  getJSTTodayString,
} from "@/shared/date";
import { AppError } from "@/shared/error/app-error";

type GetDateUpdateDeps = { db: DbClient };
type GetDateUpdateInput = { userId: string };

/**
 * 日付更新チェック
 *
 * ビジネスロジック:
 * 1. デイリー更新: 最新のworld_build_logのcreateDateが今日（JST）であれば更新あり
 *    - daily.imageUrl は今週のweekly_worldのimageUrl
 * 2. ウィークリー更新: 前週のweekly_worldが存在すれば更新あり
 *    - weekly.imageUrl は前週のweeklyWorldImageUrl
 * 3. ステータス:
 *    - dailyもweeklyもあれば "weekly_update"（ウィークリー優先）
 *    - weeklyのみでも "weekly_update"
 *    - dailyのみなら "daily_update"
 *    - どちらもなければ "no_update"
 */
export const getDateUpdate = async (
  deps: GetDateUpdateDeps,
  input: GetDateUpdateInput,
): Promise<GetDateUpdateOutput> => {
  const { db } = deps;
  const { userId } = input;

  // プロフィール取得
  const profile = await getUserProfileByUserId(db, userId);
  if (!profile) {
    throw new AppError("NOT_FOUND", {
      message: "プロフィールが見つかりません",
    });
  }

  // JST基準の日付を取得
  const todayString = getJSTTodayString();
  const previousWeekStart = getJSTPreviousWeekStart();

  // 並列でデータ取得
  const [latestBuildLog, previousWeekWorld] = await Promise.all([
    getLatestBuildLogByProfileId(db, profile.id),
    getWeeklyWorldByWeekStart(db, profile.id, previousWeekStart),
  ]);

  // デイリー更新判定
  // 注意: createDate は Worker 側で JST 基準の日付として DATE 型に保存されている
  // （例: JST 2025-12-19 の投稿 → DB には "2025-12-19" が保存）
  // そのため追加の JST 変換は不要で、formatDateString で直接比較可能
  let daily: GetDateUpdateOutput["daily"] = null;
  if (latestBuildLog) {
    const buildLogDateString = formatDateString(
      latestBuildLog.buildLog.createDate,
    );
    if (buildLogDateString === todayString) {
      daily = {
        imageUrl: latestBuildLog.weeklyWorldImageUrl,
      };
    }
  }

  // ウィークリー更新判定
  let weekly: GetDateUpdateOutput["weekly"] = null;
  if (previousWeekWorld) {
    weekly = {
      imageUrl: previousWeekWorld.weeklyWorldImageUrl,
    };
  }

  // ステータス決定
  let status: GetDateUpdateOutput["status"];
  if (weekly) {
    status = "weekly_update";
  } else if (daily) {
    status = "daily_update";
  } else {
    status = "no_update";
  }

  return {
    date: todayString,
    status,
    daily,
    weekly,
  };
};
