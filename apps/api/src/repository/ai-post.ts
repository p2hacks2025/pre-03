import {
  aiPosts,
  aiProfiles,
  and,
  type DbClient,
  desc,
  eq,
  gte,
  isNull,
  lt,
  lte,
  or,
} from "@packages/db";

export type GetAiPostsForTimelineOptions = {
  userProfileId: string;
  from?: Date;
  to?: Date;
  cursor?: { createdAt: Date; id: string };
  limit: number;
};

export type AiPostWithProfile = {
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
): Promise<AiPostWithProfile[]> => {
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

  // biome-ignore lint/style/noNonNullAssertion: or() は常にSQLオブジェクトを返す
  conditions.push(userOrStandaloneCondition!);

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
    // biome-ignore lint/style/noNonNullAssertion: or() は常にSQLオブジェクトを返す
    conditions.push(cursorCondition!);
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
