import {
  type AiPost,
  type AiProfile,
  aiPosts,
  aiProfiles,
  and,
  asc,
  type DbClient,
  desc,
  eq,
  gte,
  isNull,
  lt,
  lte,
  or,
} from "@packages/db";
import { jstToUTC } from "@/shared/date";

// ===== Timeline用 =====

export type GetAiPostsForTimelineOptions = {
  userProfileId: string;
  from?: Date;
  to?: Date;
  cursor?: { createdAt: Date; id: string };
  limit: number;
};

export type AiPostWithProfileForTimeline = {
  id: string;
  content: string;
  imageUrl: string | null;
  publishedAt: Date;
  aiProfile: {
    username: string;
    avatarUrl: string | null;
  };
};

/**
 * タイムライン用にAIポストを取得
 * - userProfileId に紐づく投稿 OR スタンドアロン投稿（userProfileId IS NULL）
 * - publishedAt <= NOW のみ（公開済み）
 */
export const getAiPostsForTimeline = async (
  db: DbClient,
  options: GetAiPostsForTimelineOptions,
): Promise<AiPostWithProfileForTimeline[]> => {
  const { userProfileId, from, to, cursor, limit } = options;
  const now = new Date();

  // ユーザーに紐づく投稿 OR スタンドアロン投稿
  const userOrStandaloneCondition = or(
    eq(aiPosts.userProfileId, userProfileId),
    isNull(aiPosts.userProfileId),
  );

  // 条件を動的に構築
  const conditions: ReturnType<typeof eq>[] = [
    isNull(aiPosts.deletedAt),
    lte(aiPosts.publishedAt, now), // 公開済みのみ
  ];

  if (userOrStandaloneCondition) {
    conditions.push(userOrStandaloneCondition);
  }

  // 日付範囲フィルタ（publishedAtベース）
  if (from) {
    conditions.push(gte(aiPosts.publishedAt, from));
  }
  if (to) {
    const toEnd = new Date(to);
    toEnd.setUTCDate(toEnd.getUTCDate() + 1);
    conditions.push(lt(aiPosts.publishedAt, toEnd));
  }

  // カーソルベースのページネーション（新しい順）
  // NOTE: カーソルのcreatedAtフィールドには、タイムライン上の表示日時（displayAt）が格納される
  //       ユーザーポストの場合はcreatedAt、AIポストの場合はpublishedAtの値となる
  if (cursor) {
    const cursorCondition = or(
      lt(aiPosts.publishedAt, cursor.createdAt),
      and(eq(aiPosts.publishedAt, cursor.createdAt), lt(aiPosts.id, cursor.id)),
    );
    if (cursorCondition) {
      conditions.push(cursorCondition);
    }
  }

  const results = await db
    .select({
      id: aiPosts.id,
      content: aiPosts.content,
      imageUrl: aiPosts.imageUrl,
      publishedAt: aiPosts.publishedAt,
      aiProfileUsername: aiProfiles.username,
      aiProfileAvatarUrl: aiProfiles.avatarUrl,
    })
    .from(aiPosts)
    .innerJoin(aiProfiles, eq(aiPosts.aiProfileId, aiProfiles.id))
    .where(and(...conditions))
    .orderBy(desc(aiPosts.publishedAt), desc(aiPosts.id))
    .limit(limit);

  return results.map((r) => ({
    id: r.id,
    content: r.content,
    imageUrl: r.imageUrl,
    publishedAt: r.publishedAt,
    aiProfile: {
      username: r.aiProfileUsername,
      avatarUrl: r.aiProfileAvatarUrl,
    },
  }));
};

// ===== Week用 =====

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
      publishedAt: aiPosts.publishedAt,
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
