import {
  and,
  type DbClient,
  desc,
  eq,
  gte,
  isNull,
  lt,
  type NewUserPost,
  or,
  sql,
  type UserPost,
  userPosts,
  userProfiles,
} from "@packages/db";
import { jstToUTC } from "@/shared/date";

export const createUserPost = async (
  db: DbClient,
  input: NewUserPost,
): Promise<UserPost> => {
  const result = await db.insert(userPosts).values(input).returning();

  return result[0];
};

export type GetUserPostsOptions = {
  profileId: string;
  from?: Date;
  to?: Date;
  cursor?: { createdAt: Date; id: string };
  limit: number;
};

export const getUserPostsByProfileId = async (
  db: DbClient,
  options: GetUserPostsOptions,
): Promise<UserPost[]> => {
  const { profileId, from, to, cursor, limit } = options;

  // 条件を動的に構築
  const conditions: ReturnType<typeof eq>[] = [
    eq(userPosts.userProfileId, profileId),
    isNull(userPosts.deletedAt),
  ];

  // 日付範囲フィルタ
  if (from) {
    conditions.push(gte(userPosts.createdAt, from));
  }
  if (to) {
    // toは日付の終わりまで含めるため、翌日の0時未満とする
    const toEnd = new Date(to);
    toEnd.setUTCDate(toEnd.getUTCDate() + 1);
    conditions.push(lt(userPosts.createdAt, toEnd));
  }

  // カーソルベースのページネーション（新しい順）
  if (cursor) {
    const cursorCondition = or(
      lt(userPosts.createdAt, cursor.createdAt),
      and(
        eq(userPosts.createdAt, cursor.createdAt),
        lt(userPosts.id, cursor.id),
      ),
    );
    // biome-ignore lint/style/noNonNullAssertion: or() は常にSQLオブジェクトを返す
    conditions.push(cursorCondition!);
  }

  return db
    .select()
    .from(userPosts)
    .where(and(...conditions))
    .orderBy(desc(userPosts.createdAt), desc(userPosts.id))
    .limit(limit);
};

export type UserPostWithProfile = {
  id: string;
  content: string;
  uploadImageUrl: string | null;
  createdAt: Date;
  userProfile: {
    username: string;
    avatarUrl: string | null;
  };
};

/**
 * タイムライン用にユーザーポストを取得（author情報付き）
 */
export const getUserPostsForTimeline = async (
  db: DbClient,
  options: GetUserPostsOptions,
): Promise<UserPostWithProfile[]> => {
  const { profileId, from, to, cursor, limit } = options;

  // 条件を動的に構築
  const conditions: ReturnType<typeof eq>[] = [
    eq(userPosts.userProfileId, profileId),
    isNull(userPosts.deletedAt),
  ];

  // 日付範囲フィルタ
  if (from) {
    conditions.push(gte(userPosts.createdAt, from));
  }
  if (to) {
    const toEnd = new Date(to);
    toEnd.setUTCDate(toEnd.getUTCDate() + 1);
    conditions.push(lt(userPosts.createdAt, toEnd));
  }

  // カーソルベースのページネーション（新しい順）
  if (cursor) {
    const cursorCondition = or(
      lt(userPosts.createdAt, cursor.createdAt),
      and(
        eq(userPosts.createdAt, cursor.createdAt),
        lt(userPosts.id, cursor.id),
      ),
    );
    // biome-ignore lint/style/noNonNullAssertion: or() は常にSQLオブジェクトを返す
    conditions.push(cursorCondition!);
  }

  const results = await db
    .select({
      id: userPosts.id,
      content: userPosts.content,
      uploadImageUrl: userPosts.uploadImageUrl,
      createdAt: userPosts.createdAt,
      userProfileUsername: userProfiles.username,
      userProfileAvatarUrl: userProfiles.avatarUrl,
    })
    .from(userPosts)
    .innerJoin(userProfiles, eq(userPosts.userProfileId, userProfiles.id))
    .where(and(...conditions))
    .orderBy(desc(userPosts.createdAt), desc(userPosts.id))
    .limit(limit);

  return results.map((r) => ({
    id: r.id,
    content: r.content,
    uploadImageUrl: r.uploadImageUrl,
    createdAt: r.createdAt,
    userProfile: {
      username: r.userProfileUsername,
      avatarUrl: r.userProfileAvatarUrl,
    },
  }));
};

export type GetEntryDatesByMonthOptions = {
  profileId: string;
  year: number;
  month: number;
};

// PostgreSQLのDATE型は文字列として返される場合がある
export type EntryDateResult = { date: Date | string };

/**
 * 指定月に日記を投稿した日のリストを取得（DISTINCTで重複排除）
 * JST基準で日付を返却
 */
export const getEntryDatesByMonth = async (
  db: DbClient,
  options: GetEntryDatesByMonthOptions,
): Promise<EntryDateResult[]> => {
  const { profileId, year, month } = options;

  // JST基準の月範囲をUTCで取得（個別に変換）
  const monthStart = jstToUTC(year, month, 1); // JST月初 0:00 → UTC
  const monthEnd = jstToUTC(year, month + 1, 1); // JST翌月初 0:00 → UTC

  const result = await db
    .selectDistinct({
      date: sql<string>`DATE(${userPosts.createdAt} AT TIME ZONE 'Asia/Tokyo')`.as(
        "date",
      ),
    })
    .from(userPosts)
    .where(
      and(
        eq(userPosts.userProfileId, profileId),
        gte(userPosts.createdAt, monthStart),
        lt(userPosts.createdAt, monthEnd),
        isNull(userPosts.deletedAt),
      ),
    )
    .orderBy(sql`DATE(${userPosts.createdAt} AT TIME ZONE 'Asia/Tokyo')`);

  return result;
};
