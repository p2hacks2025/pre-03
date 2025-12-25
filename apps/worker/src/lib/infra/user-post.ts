import {
  and,
  eq,
  gte,
  isNull,
  lt,
  sql,
  type UserPost,
  userPosts,
} from "@packages/db";
import { JST_OFFSET } from "../constants";
import type { WorkerContext } from "../context";

export type UserPostsGroupedByUser = {
  userProfileId: string;
  posts: UserPost[];
};

export const getUserPostsByDate = async (
  ctx: WorkerContext,
  targetDate: Date,
): Promise<UserPostsGroupedByUser[]> => {
  const dayStart = new Date(targetDate.getTime() - JST_OFFSET);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  ctx.logger.info("Fetching user posts", {
    targetDate: targetDate.toISOString().split("T")[0],
  });

  const posts = await ctx.db
    .select()
    .from(userPosts)
    .where(
      and(
        gte(userPosts.createdAt, dayStart),
        lt(userPosts.createdAt, dayEnd),
        isNull(userPosts.deletedAt),
      ),
    );

  const groupedMap = new Map<string, UserPost[]>();
  for (const post of posts) {
    if (!groupedMap.has(post.userProfileId)) {
      groupedMap.set(post.userProfileId, []);
    }
    groupedMap.get(post.userProfileId)?.push(post);
  }

  const result: UserPostsGroupedByUser[] = [];
  for (const [userProfileId, userPosts] of groupedMap) {
    result.push({ userProfileId, posts: userPosts });
  }

  return result;
};

export const getUserPostsForWeek = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
): Promise<UserPost[]> => {
  const weekStart = new Date(weekStartDate.getTime() - JST_OFFSET);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  return ctx.db
    .select()
    .from(userPosts)
    .where(
      and(
        eq(userPosts.userProfileId, userProfileId),
        gte(userPosts.createdAt, weekStart),
        lt(userPosts.createdAt, weekEnd),
        isNull(userPosts.deletedAt),
      ),
    );
};

export const getRecentUserPosts = async (
  ctx: WorkerContext,
  minutes: number,
): Promise<UserPost[]> => {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  return ctx.db
    .select()
    .from(userPosts)
    .where(and(gte(userPosts.createdAt, since), isNull(userPosts.deletedAt)));
};

export const getRandomHistoricalPosts = async (
  ctx: WorkerContext,
  count: number,
  excludeDays: number,
): Promise<UserPost[]> => {
  const excludeDate = new Date(Date.now() - excludeDays * 24 * 60 * 60 * 1000);
  return ctx.db
    .select()
    .from(userPosts)
    .where(
      and(lt(userPosts.createdAt, excludeDate), isNull(userPosts.deletedAt)),
    )
    .orderBy(sql`RANDOM()`)
    .limit(count);
};

/**
 * 過去投稿があるユーザーIDのリストを取得
 */
export const getUserIdsWithHistoricalPosts = async (
  ctx: WorkerContext,
  excludeDays: number,
): Promise<string[]> => {
  const excludeDate = new Date(Date.now() - excludeDays * 24 * 60 * 60 * 1000);
  const result = await ctx.db
    .selectDistinct({ userProfileId: userPosts.userProfileId })
    .from(userPosts)
    .where(
      and(lt(userPosts.createdAt, excludeDate), isNull(userPosts.deletedAt)),
    );
  return result.map((r) => r.userProfileId);
};

/**
 * 特定ユーザーの過去投稿からランダムにN件を取得
 */
export const getRandomHistoricalPostsForUser = async (
  ctx: WorkerContext,
  userProfileId: string,
  excludeDays: number,
  count: number,
): Promise<UserPost[]> => {
  const excludeDate = new Date(Date.now() - excludeDays * 24 * 60 * 60 * 1000);
  return ctx.db
    .select()
    .from(userPosts)
    .where(
      and(
        eq(userPosts.userProfileId, userProfileId),
        lt(userPosts.createdAt, excludeDate),
        isNull(userPosts.deletedAt),
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(count);
};

/**
 * 複数ユーザーの過去投稿からランダムにN件ずつ取得
 */
export const getRandomHistoricalPostsForUsers = async (
  ctx: WorkerContext,
  userProfileIds: string[],
  excludeDays: number,
  countPerUser: number,
): Promise<Map<string, UserPost[]>> => {
  if (userProfileIds.length === 0) {
    return new Map();
  }

  const excludeDate = new Date(Date.now() - excludeDays * 24 * 60 * 60 * 1000);

  const result = await ctx.db.execute<{
    id: string;
    user_profile_id: string;
    content: string;
    upload_image_url: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }>(sql`
    SELECT t.*
    FROM (
      SELECT p.*,
             row_number() OVER (
               PARTITION BY p.user_profile_id
               ORDER BY random()
             ) AS rn
      FROM user_posts p
      WHERE p.user_profile_id = ANY(${userProfileIds})
        AND p.created_at < ${excludeDate}
        AND p.deleted_at IS NULL
    ) t
    WHERE t.rn <= ${countPerUser}
  `);

  const postMap = new Map<string, UserPost[]>();
  for (const row of result) {
    const userProfileId = row.user_profile_id;
    if (!postMap.has(userProfileId)) {
      postMap.set(userProfileId, []);
    }
    const post: UserPost = {
      id: row.id,
      userProfileId: row.user_profile_id,
      content: row.content,
      uploadImageUrl: row.upload_image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
    postMap.get(userProfileId)?.push(post);
  }

  return postMap;
};
