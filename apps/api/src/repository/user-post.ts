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
} from "@packages/db";

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
    toEnd.setDate(toEnd.getDate() + 1);
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
    if (cursorCondition) {
      conditions.push(cursorCondition);
    }
  }

  return db
    .select()
    .from(userPosts)
    .where(and(...conditions))
    .orderBy(desc(userPosts.createdAt), desc(userPosts.id))
    .limit(limit);
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
 * UTCベースで日付範囲を指定（DBはUTCで保存されているため）
 */
export const getEntryDatesByMonth = async (
  db: DbClient,
  options: GetEntryDatesByMonthOptions,
): Promise<EntryDateResult[]> => {
  const { profileId, year, month } = options;

  // UTCで日付範囲を作成（タイムゾーンズレ防止）
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1)); // 翌月1日

  const result = await db
    .selectDistinct({
      date: sql<Date>`DATE(${userPosts.createdAt})`.as("date"),
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
    .orderBy(sql`DATE(${userPosts.createdAt})`);

  return result;
};
