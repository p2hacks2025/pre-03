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
