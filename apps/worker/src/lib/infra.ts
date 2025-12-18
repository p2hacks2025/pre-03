import {
  type AiPost,
  type AiProfile,
  aiPosts,
  aiProfiles,
  and,
  eq,
  gte,
  isNull,
  lt,
  lte,
  sql,
  type UserPost,
  type UserProfile,
  userPosts,
  userProfiles,
  type WeeklyWorld,
  weeklyWorlds,
  worldBuildLogs,
} from "@packages/db";
import { FIELD_ID_MAX, FIELD_ID_MIN, JST_OFFSET } from "./constants";
import type { WorkerContext } from "./context";

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

export const getWeeklyWorld = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
): Promise<WeeklyWorld> => {
  const existing = await ctx.db
    .select()
    .from(weeklyWorlds)
    .where(
      and(
        eq(weeklyWorlds.userProfileId, userProfileId),
        eq(weeklyWorlds.weekStartDate, weekStartDate),
        isNull(weeklyWorlds.deletedAt),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    ctx.logger.error("Weekly world not found", {
      userProfileId,
      weekStartDate: weekStartDate.toISOString().split("T")[0],
    });
    throw new Error(
      `Weekly world not found for user ${userProfileId} week ${weekStartDate.toISOString().split("T")[0]}`,
    );
  }

  return existing[0];
};

export const selectFieldId = async (
  ctx: WorkerContext,
  weeklyWorldId: string,
): Promise<{ fieldId: number; isOverwrite: boolean }> => {
  const usedLogs = await ctx.db
    .select({ fieldId: worldBuildLogs.fieldId })
    .from(worldBuildLogs)
    .where(eq(worldBuildLogs.weeklyWorldId, weeklyWorldId));

  const usedFieldIds = new Set(usedLogs.map((log) => log.fieldId));

  const availableFieldIds: number[] = [];
  for (let i = FIELD_ID_MIN; i <= FIELD_ID_MAX; i++) {
    if (!usedFieldIds.has(i)) {
      availableFieldIds.push(i);
    }
  }

  if (availableFieldIds.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableFieldIds.length);
    return { fieldId: availableFieldIds[randomIndex], isOverwrite: false };
  }

  const randomFieldId =
    Math.floor(Math.random() * (FIELD_ID_MAX - FIELD_ID_MIN + 1)) +
    FIELD_ID_MIN;
  return { fieldId: randomFieldId, isOverwrite: true };
};

export const createOrUpdateWorldBuildLog = async (
  ctx: WorkerContext,
  weeklyWorldId: string,
  fieldId: number,
  createDate: Date,
  isOverwrite: boolean,
): Promise<void> => {
  if (isOverwrite) {
    await ctx.db
      .update(worldBuildLogs)
      .set({ createDate })
      .where(
        and(
          eq(worldBuildLogs.weeklyWorldId, weeklyWorldId),
          eq(worldBuildLogs.fieldId, fieldId),
        ),
      );
  } else {
    await ctx.db.insert(worldBuildLogs).values({
      weeklyWorldId,
      fieldId,
      createDate,
    });
  }
};

export const updateWeeklyWorldImage = async (
  ctx: WorkerContext,
  weeklyWorldId: string,
  newImageUrl: string,
): Promise<void> => {
  await ctx.db
    .update(weeklyWorlds)
    .set({ weeklyWorldImageUrl: newImageUrl })
    .where(eq(weeklyWorlds.id, weeklyWorldId));
};

export const uploadGeneratedImage = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
  imageBuffer: Buffer,
): Promise<string> => {
  const weekStr = weekStartDate.toISOString().split("T")[0];
  const timestamp = Date.now();
  const path = `weekly-worlds/${userProfileId}/${weekStr}/world_${timestamp}.png`;

  const { error } = await ctx.supabase.storage
    .from("images")
    .upload(path, imageBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload generated image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = ctx.supabase.storage.from("images").getPublicUrl(path);

  return publicUrl;
};

export const getAllUserProfiles = async (
  ctx: WorkerContext,
): Promise<UserProfile[]> => {
  return ctx.db
    .select()
    .from(userProfiles)
    .where(isNull(userProfiles.deletedAt));
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

export const createWeeklyWorld = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
  imageUrl: string,
): Promise<WeeklyWorld> => {
  const [created] = await ctx.db
    .insert(weeklyWorlds)
    .values({
      userProfileId,
      weekStartDate,
      weeklyWorldImageUrl: imageUrl,
    })
    .returning();

  return created;
};

export const findWeeklyWorld = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
): Promise<WeeklyWorld | null> => {
  const existing = await ctx.db
    .select()
    .from(weeklyWorlds)
    .where(
      and(
        eq(weeklyWorlds.userProfileId, userProfileId),
        eq(weeklyWorlds.weekStartDate, weekStartDate),
        isNull(weeklyWorlds.deletedAt),
      ),
    )
    .limit(1);

  return existing[0] ?? null;
};

// AI Post related

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
  scheduledAt: Date;
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
      scheduledAt: params.scheduledAt,
    })
    .returning();
  return created;
};

export const publishDueAiPosts = async (
  ctx: WorkerContext,
): Promise<string[]> => {
  const now = new Date();
  const published = await ctx.db
    .update(aiPosts)
    .set({ publishedAt: now })
    .where(
      and(
        lte(aiPosts.scheduledAt, now),
        isNull(aiPosts.publishedAt),
        isNull(aiPosts.deletedAt),
      ),
    )
    .returning({ id: aiPosts.id });

  return published.map((p) => p.id);
};
