import {
  type AiPost,
  type AiProfile,
  aiPosts,
  aiProfiles,
  and,
  asc,
  type DbClient,
  eq,
  gte,
  isNull,
  lt,
} from "@packages/db";
import { jstToUTC } from "@/shared/date";

export type AiPostWithProfile = AiPost & {
  aiProfile: AiProfile;
};

export type GetAiPostsByWeekOptions = {
  profileId: string;
  weekStartDate: Date;
};

/**
 * 指定週に関連するAI投稿を取得（ai_profileをJOINして返却）
 * sourceStartAt〜sourceEndAtが週の範囲と重なるものを取得
 *
 * 週の範囲: weekStartDate 00:00 JST 〜 weekStartDate+7日 00:00 JST
 *
 * 重なり条件:
 *   sourceStartAt < weekEnd AND sourceEndAt >= weekStart
 */
export const getAiPostsByWeek = async (
  db: DbClient,
  options: GetAiPostsByWeekOptions,
): Promise<AiPostWithProfile[]> => {
  const { profileId, weekStartDate } = options;

  // 週の範囲をJST基準で計算してUTCに変換
  const year = weekStartDate.getUTCFullYear();
  const month = weekStartDate.getUTCMonth() + 1;
  const day = weekStartDate.getUTCDate();

  const weekStart = jstToUTC(year, month, day);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const result = await db
    .select({
      id: aiPosts.id,
      aiProfileId: aiPosts.aiProfileId,
      userProfileId: aiPosts.userProfileId,
      content: aiPosts.content,
      imageUrl: aiPosts.imageUrl,
      sourceStartAt: aiPosts.sourceStartAt,
      sourceEndAt: aiPosts.sourceEndAt,
      createdAt: aiPosts.createdAt,
      updatedAt: aiPosts.updatedAt,
      deletedAt: aiPosts.deletedAt,
      aiProfile: {
        id: aiProfiles.id,
        username: aiProfiles.username,
        avatarUrl: aiProfiles.avatarUrl,
        description: aiProfiles.description,
        createdAt: aiProfiles.createdAt,
        updatedAt: aiProfiles.updatedAt,
        deletedAt: aiProfiles.deletedAt,
      },
    })
    .from(aiPosts)
    .innerJoin(aiProfiles, eq(aiPosts.aiProfileId, aiProfiles.id))
    .where(
      and(
        eq(aiPosts.userProfileId, profileId),
        // 週の範囲と重なる条件
        lt(aiPosts.sourceStartAt, weekEnd),
        gte(aiPosts.sourceEndAt, weekStart),
        isNull(aiPosts.deletedAt),
        isNull(aiProfiles.deletedAt),
      ),
    )
    .orderBy(asc(aiPosts.createdAt));

  return result;
};
