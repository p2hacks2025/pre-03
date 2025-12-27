import {
  type AiPost,
  type AiProfile,
  aiPosts,
  aiProfiles,
  and,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  sql,
} from "@packages/db";
import type { WorkerContext } from "../context";

export const getRandomAiProfile = async (
  ctx: WorkerContext,
): Promise<AiProfile> => {
  const profiles = await ctx.db
    .select()
    .from(aiProfiles)
    .where(isNull(aiProfiles.deletedAt));

  if (profiles.length === 0) {
    throw new Error("No AI profiles found");
  }

  return profiles[Math.floor(Math.random() * profiles.length)];
};

export const hasExistingAiPost = async (
  ctx: WorkerContext,
  userProfileId: string | null,
  sourceStartAt: Date,
  sourceEndAt: Date,
): Promise<boolean> => {
  const userCondition =
    userProfileId === null
      ? isNull(aiPosts.userProfileId)
      : eq(aiPosts.userProfileId, userProfileId);

  const existing = await ctx.db
    .select({ id: aiPosts.id })
    .from(aiPosts)
    .where(
      and(
        userCondition,
        eq(aiPosts.sourceStartAt, sourceStartAt),
        eq(aiPosts.sourceEndAt, sourceEndAt),
        isNull(aiPosts.deletedAt),
      ),
    )
    .limit(1);
  return existing.length > 0;
};

export type CreateAiPostParams = {
  aiProfileId: string;
  userProfileId: string | null;
  content: string;
  sourceStartAt: Date;
  sourceEndAt: Date;
  publishedAt: Date;
  imageUrl?: string;
};

export const createAiPost = async (
  ctx: WorkerContext,
  params: CreateAiPostParams,
): Promise<AiPost> => {
  const [created] = await ctx.db
    .insert(aiPosts)
    .values({
      aiProfileId: params.aiProfileId,
      userProfileId: params.userProfileId,
      content: params.content,
      imageUrl: params.imageUrl ?? null,
      sourceStartAt: params.sourceStartAt,
      sourceEndAt: params.sourceEndAt,
      publishedAt: params.publishedAt,
    })
    .returning();
  return created;
};

/**
 * 複数のAI投稿を一括作成
 */
export const createAiPostsBatch = async (
  ctx: WorkerContext,
  posts: CreateAiPostParams[],
): Promise<AiPost[]> => {
  if (posts.length === 0) {
    return [];
  }

  const values = posts.map((params) => ({
    aiProfileId: params.aiProfileId,
    userProfileId: params.userProfileId,
    content: params.content,
    imageUrl: params.imageUrl ?? null,
    sourceStartAt: params.sourceStartAt,
    sourceEndAt: params.sourceEndAt,
    publishedAt: params.publishedAt,
  }));

  return ctx.db.insert(aiPosts).values(values).returning();
};

/**
 * 直近N分間に公開されたAI投稿の数を取得
 */
export const countRecentAiPosts = async (
  ctx: WorkerContext,
  minutes: number,
): Promise<number> => {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  const now = new Date();

  const result = await ctx.db
    .select({ count: sql<number>`count(*)` })
    .from(aiPosts)
    .where(
      and(
        gte(aiPosts.publishedAt, since),
        lte(aiPosts.publishedAt, now),
        isNull(aiPosts.deletedAt),
      ),
    );

  return Number(result[0]?.count ?? 0);
};

/**
 * 直近N分間に特定ユーザーに対して公開されたAI投稿の数を取得
 */
export const countRecentAiPostsForUser = async (
  ctx: WorkerContext,
  userProfileId: string,
  minutes: number,
): Promise<number> => {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  const now = new Date();

  const result = await ctx.db
    .select({ count: sql<number>`count(*)` })
    .from(aiPosts)
    .where(
      and(
        eq(aiPosts.userProfileId, userProfileId),
        gte(aiPosts.publishedAt, since),
        lte(aiPosts.publishedAt, now),
        isNull(aiPosts.deletedAt),
      ),
    );

  return Number(result[0]?.count ?? 0);
};

/**
 * 直近N分間に複数ユーザーに対して公開されたAI投稿の数を一括取得
 */
export const countRecentAiPostsForUsers = async (
  ctx: WorkerContext,
  userProfileIds: string[],
  minutes: number,
): Promise<Map<string, number>> => {
  if (userProfileIds.length === 0) {
    return new Map();
  }

  const since = new Date(Date.now() - minutes * 60 * 1000);
  const now = new Date();

  const result = await ctx.db
    .select({
      userProfileId: aiPosts.userProfileId,
      count: sql<number>`count(*)`,
    })
    .from(aiPosts)
    .where(
      and(
        inArray(aiPosts.userProfileId, userProfileIds),
        gte(aiPosts.publishedAt, since),
        lte(aiPosts.publishedAt, now),
        isNull(aiPosts.deletedAt),
      ),
    )
    .groupBy(aiPosts.userProfileId);

  const countMap = new Map<string, number>();
  for (const row of result) {
    if (row.userProfileId) {
      countMap.set(row.userProfileId, Number(row.count));
    }
  }
  return countMap;
};
