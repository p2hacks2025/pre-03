import {
  and,
  type DbClient,
  eq,
  gte,
  isNull,
  lte,
  type WeeklyWorld,
  weeklyWorlds,
} from "@packages/db";

export type GetWeeklyWorldsByDateRangeOptions = {
  profileId: string;
  startDate: Date;
  endDate: Date;
};

/**
 * 指定した日付範囲内のweeklyWorldsを取得
 * N+1を避けるため、範囲内の全レコードを一括取得
 */
export const getWeeklyWorldsByDateRange = async (
  db: DbClient,
  options: GetWeeklyWorldsByDateRangeOptions,
): Promise<WeeklyWorld[]> => {
  const { profileId, startDate, endDate } = options;

  return db
    .select()
    .from(weeklyWorlds)
    .where(
      and(
        eq(weeklyWorlds.userProfileId, profileId),
        gte(weeklyWorlds.weekStartDate, startDate),
        lte(weeklyWorlds.weekStartDate, endDate),
        isNull(weeklyWorlds.deletedAt),
      ),
    );
};

export type GetWeeklyWorldByDateOptions = {
  profileId: string;
  weekStartDate: Date;
};

/**
 * 特定の週開始日でweeklyWorldを1件取得
 */
export const getWeeklyWorldByDate = async (
  db: DbClient,
  options: GetWeeklyWorldByDateOptions,
): Promise<WeeklyWorld | null> => {
  const { profileId, weekStartDate } = options;

  const result = await db
    .select()
    .from(weeklyWorlds)
    .where(
      and(
        eq(weeklyWorlds.userProfileId, profileId),
        eq(weeklyWorlds.weekStartDate, weekStartDate),
        isNull(weeklyWorlds.deletedAt),
      ),
    )
    .limit(1);

  return result[0] ?? null;
};
