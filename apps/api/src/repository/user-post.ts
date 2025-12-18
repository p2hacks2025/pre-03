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
