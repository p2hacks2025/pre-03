import {
  type AiPost,
  type AiProfile,
  aiPosts,
  aiProfiles,
  and,
  eq,
  gte,
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
 * 過去N分間にpublishedAtが設定されているAI投稿の数をカウント
 * 頻度制御に使用（上限/下限チェック）
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
