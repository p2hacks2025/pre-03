import {
  type DbClient,
  desc,
  eq,
  type WorldBuildLog,
  weeklyWorlds,
  worldBuildLogs,
} from "@packages/db";

export type LatestBuildLogWithWorld = {
  buildLog: WorldBuildLog;
  weeklyWorldImageUrl: string | null;
};

/**
 * ユーザーの最新のworld_build_logを取得（weekly_world情報付き）
 * @param db - DBクライアント
 * @param profileId - ユーザープロフィールID
 * @returns 最新のビルドログとワールド画像URL、存在しない場合はnull
 */
export const getLatestBuildLogByProfileId = async (
  db: DbClient,
  profileId: string,
): Promise<LatestBuildLogWithWorld | null> => {
  const result = await db
    .select({
      buildLog: worldBuildLogs,
      weeklyWorldImageUrl: weeklyWorlds.weeklyWorldImageUrl,
    })
    .from(worldBuildLogs)
    .innerJoin(weeklyWorlds, eq(worldBuildLogs.weeklyWorldId, weeklyWorlds.id))
    .where(eq(weeklyWorlds.userProfileId, profileId))
    .orderBy(desc(worldBuildLogs.createDate))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    buildLog: result[0].buildLog,
    weeklyWorldImageUrl: result[0].weeklyWorldImageUrl,
  };
};
