import type { AiProfile, UserPost } from "@packages/db";
import OpenAI from "openai";
import {
  type CreateAiPostParams,
  createAiPost,
  createAiPostsBatch,
  getAiPostGenerationPrompt,
  getAiPostStandalonePrompt,
  getRandomAiProfile,
  getRandomHistoricalPosts,
  getRandomHistoricalPostsForUser,
  getRecentUserPosts,
  getUserIdsWithHistoricalPosts,
  hasExistingAiPost,
  interpolatePrompt,
  LLM_CONFIG,
  type WorkerContext,
} from "@/lib";

// 確率上限
export const USER_CHANCE_MAX = 0.25;

// 時間範囲ごとの確率設定
// 短い範囲: perPostChance高め（短時間で多く投稿 = 活発 = 高確率）
// 長い範囲: perPostChance低め（長時間での投稿 = 普通 = 確率あまり上げない）
export const TIME_WINDOWS = [
  { minutes: 30, baseChance: 0.15, perPostChance: 0.01 }, // 30分: 1投稿=15%, 3投稿=17%, 11投稿=25%
  { minutes: 60, baseChance: 0.1, perPostChance: 0.005 }, // 1時間: 1投稿=10%, 3投稿=11%
  { minutes: 360, baseChance: 0.05, perPostChance: 0.0025 }, // 6時間: 1投稿=5%, 3投稿=5.5%
  { minutes: 720, baseChance: 0.03, perPostChance: 0.0015 }, // 12時間: 1投稿=3%, 3投稿=3.3%
  { minutes: 1440, baseChance: 0.02, perPostChance: 0.001 }, // 24時間: 1投稿=2%, 3投稿=2.2%
] as const;

export type TimeWindow = (typeof TIME_WINDOWS)[number];

// ユーザーのポスト数に応じた確率計算（上限25%）
export const calculateUserChance = (
  postCount: number,
  window: TimeWindow,
): number => {
  return Math.min(
    window.baseChance + (postCount - 1) * window.perPostChance,
    USER_CHANCE_MAX,
  );
};

// Constants
export const AI_POST_CONFIG = {
  SHORT_TERM_MINUTES: 30,
  LONG_TERM_EXCLUDE_DAYS: 7,
  SHORT_TERM_SCHEDULE_MIN: 1,
  SHORT_TERM_SCHEDULE_MAX: 30,
  LONG_TERM_SCHEDULE_MIN: 60,
  LONG_TERM_SCHEDULE_MAX: 1440,
  MAX_RETRIES: 3,
  MAX_POST_LENGTH: 50,
  MAX_INPUT_LENGTH: 1000,
  POSTS_PER_USER: 2,
  STANDALONE_POST_COUNT: 1,
  SHORT_TERM_POST_CHANCE: 0.02,
  LONG_TERM_POST_CHANCE: 0.5,
  LONG_TERM_USER_CHANCE: 0.5, // ユーザーごとの確率（50%）
  LONG_TERM_POSTS_PER_USER: 2, // ユーザーごとの投稿数
  // 頻度制御
  FREQUENCY_CHECK_WINDOW_MINUTES: 60,
  MAX_POSTS_PER_HOUR: 5,
  MIN_POSTS_PER_HOUR: 0,
} as const;

export type DiaryGroup = {
  userProfileId: string;
  posts: UserPost[];
};

export type GenerationResult = {
  generated: number;
  errors: string[];
};

type PostsResponse = {
  posts: string[];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const shouldExecuteWithChance = (chance: number): boolean =>
  Math.random() < chance;

const sanitizeUserInput = (input: string): string => {
  return input
    .slice(0, AI_POST_CONFIG.MAX_INPUT_LENGTH) // Limit length
    .replace(/```/g, "") // Remove code blocks
    .replace(/\{[^}]*\}/g, "") // Remove template-like patterns
    .replace(
      /(ignore|forget|disregard|override|system|prompt|instruction)/gi,
      "",
    )
    .trim();
};

const buildPrompt = (
  template: string,
  aiProfile: AiProfile,
  postCount: number,
): string =>
  interpolatePrompt(template, {
    ai_profile_name: aiProfile.username,
    ai_profile_description: aiProfile.description,
    post_count: postCount,
  });

const callOpenAIJsonWithRetry = async (
  ctx: WorkerContext,
  messages: OpenAI.ChatCompletionMessageParam[],
  maxRetries = AI_POST_CONFIG.MAX_RETRIES,
): Promise<PostsResponse> => {
  const openai = new OpenAI({ apiKey: ctx.env.OPENAI_API_KEY });
  const { model, maxCompletionTokens, responseFormat } = LLM_CONFIG.aiPost;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        response_format: responseFormat,
        max_completion_tokens: maxCompletionTokens,
      });
      const choice = response.choices[0];
      ctx.logger.debug("OpenAI response", {
        finishReason: choice?.finish_reason,
        refusal: choice?.message?.refusal,
        hasContent: !!choice?.message?.content,
      });
      const text = choice?.message?.content;
      if (!text) {
        throw new Error(
          `No text in OpenAI response (finish_reason: ${choice?.finish_reason}, refusal: ${choice?.message?.refusal})`,
        );
      }

      const parsed = JSON.parse(text) as PostsResponse;
      if (!Array.isArray(parsed.posts)) {
        throw new Error("Invalid response format: posts array not found");
      }

      // Truncate each post to max length
      parsed.posts = parsed.posts.map((post) =>
        post.slice(0, AI_POST_CONFIG.MAX_POST_LENGTH),
      );

      return parsed;
    } catch (error) {
      const isRateLimit =
        error instanceof OpenAI.RateLimitError ||
        (error instanceof Error && error.message.includes("rate limit"));

      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = Math.min(2 ** (attempt + 2) * 1000, 30000);
        ctx.logger.warn("Rate limited, retrying...", { attempt, delay });
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
};

export const groupPostsByUser = (posts: UserPost[]): DiaryGroup[] => {
  const grouped = new Map<string, UserPost[]>();
  for (const post of posts) {
    const list = grouped.get(post.userProfileId) ?? [];
    list.push(post);
    grouped.set(post.userProfileId, list);
  }
  return Array.from(grouped, ([userProfileId, posts]) => ({
    userProfileId,
    posts,
  }));
};

export const generateAiPostContents = async (
  ctx: WorkerContext,
  aiProfile: AiProfile,
  diaryContent: string,
  postCount: number = AI_POST_CONFIG.POSTS_PER_USER,
): Promise<string[]> => {
  const systemPrompt = buildPrompt(
    getAiPostGenerationPrompt(),
    aiProfile,
    postCount,
  );
  const response = await callOpenAIJsonWithRetry(ctx, [
    { role: "system", content: systemPrompt },
    { role: "user", content: sanitizeUserInput(diaryContent) },
  ]);
  return response.posts;
};

export const generateStandaloneAiPostContents = async (
  ctx: WorkerContext,
  aiProfile: AiProfile,
  postCount: number = AI_POST_CONFIG.STANDALONE_POST_COUNT,
): Promise<string[]> => {
  const systemPrompt = buildPrompt(
    getAiPostStandalonePrompt(),
    aiProfile,
    postCount,
  );
  const response = await callOpenAIJsonWithRetry(ctx, [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Please write posts." },
  ]);
  return response.posts;
};

export const generateStandalonePosts = async (
  ctx: WorkerContext,
  scheduleMin: number,
  scheduleMax: number,
): Promise<GenerationResult> => {
  const result: GenerationResult = { generated: 0, errors: [] };
  const postCount = AI_POST_CONFIG.STANDALONE_POST_COUNT;
  ctx.logger.info("Generating standalone AI posts", { postCount });

  try {
    const aiProfile = await getRandomAiProfile(ctx);
    const contents = await generateStandaloneAiPostContents(
      ctx,
      aiProfile,
      postCount,
    );
    const now = new Date();

    for (const content of contents) {
      await createAiPost(ctx, {
        aiProfileId: aiProfile.id,
        userProfileId: null,
        content,
        sourceStartAt: now,
        sourceEndAt: now,
        publishedAt: getRandomPublishedAt(scheduleMin, scheduleMax),
      });
      result.generated++;
    }
  } catch (error) {
    result.errors.push(`Standalone: ${(error as Error).message}`);
    ctx.logger.error("Failed to generate standalone posts", {}, error as Error);
  }

  return result;
};

export const getRandomPublishedAt = (min: number, max: number): Date =>
  new Date(
    Date.now() +
      (Math.floor(Math.random() * (max - min + 1)) + min) * 60 * 1000,
  );

export const fetchRecentUserPosts = async (
  ctx: WorkerContext,
  minutes: number,
): Promise<UserPost[]> => {
  return getRecentUserPosts(ctx, minutes);
};

export const fetchRandomHistoricalPosts = async (
  ctx: WorkerContext,
  count: number,
  excludeDays: number,
): Promise<UserPost[]> => {
  return getRandomHistoricalPosts(ctx, count, excludeDays);
};

export const fetchUserIdsWithHistoricalPosts = async (
  ctx: WorkerContext,
  excludeDays: number,
): Promise<string[]> => {
  return getUserIdsWithHistoricalPosts(ctx, excludeDays);
};

export const fetchRandomHistoricalPostsForUser = async (
  ctx: WorkerContext,
  userProfileId: string,
  excludeDays: number,
  count: number,
): Promise<UserPost[]> => {
  return getRandomHistoricalPostsForUser(
    ctx,
    userProfileId,
    excludeDays,
    count,
  );
};

export const processUserAiPosts = async (
  ctx: WorkerContext,
  group: DiaryGroup,
  scheduleMin: number,
  scheduleMax: number,
): Promise<{ generated: number }> => {
  const diaryContent = group.posts.map((p) => p.content).join("\n\n");
  const sorted = [...group.posts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const sourceStartAt = new Date(sorted[0].createdAt);
  const sourceEndAt = new Date(sorted[sorted.length - 1].createdAt);

  if (
    await hasExistingAiPost(
      ctx,
      group.userProfileId,
      sourceStartAt,
      sourceEndAt,
    )
  ) {
    return { generated: 0 };
  }

  const aiProfile = await getRandomAiProfile(ctx);
  const contents = await generateAiPostContents(
    ctx,
    aiProfile,
    diaryContent,
    AI_POST_CONFIG.POSTS_PER_USER,
  );

  if (contents.length === 0) {
    return { generated: 0 };
  }

  const posts: CreateAiPostParams[] = contents.map((content) => ({
    aiProfileId: aiProfile.id,
    userProfileId: group.userProfileId,
    content,
    sourceStartAt,
    sourceEndAt,
    publishedAt: getRandomPublishedAt(scheduleMin, scheduleMax),
  }));

  const created = await createAiPostsBatch(ctx, posts);
  return { generated: created.length };
};

export const processHistoricalAiPost = async (
  ctx: WorkerContext,
  diary: UserPost,
  scheduleMin: number,
  scheduleMax: number,
): Promise<{ generated: number }> => {
  const sourceDate = new Date(diary.createdAt);

  if (
    await hasExistingAiPost(ctx, diary.userProfileId, sourceDate, sourceDate)
  ) {
    return { generated: 0 };
  }

  const aiProfile = await getRandomAiProfile(ctx);
  const contents = await generateAiPostContents(
    ctx,
    aiProfile,
    diary.content,
    AI_POST_CONFIG.POSTS_PER_USER,
  );

  if (contents.length === 0) {
    return { generated: 0 };
  }

  const posts: CreateAiPostParams[] = contents.map((content) => ({
    aiProfileId: aiProfile.id,
    userProfileId: diary.userProfileId,
    content,
    sourceStartAt: sourceDate,
    sourceEndAt: sourceDate,
    publishedAt: getRandomPublishedAt(scheduleMin, scheduleMax),
  }));

  const created = await createAiPostsBatch(ctx, posts);
  return { generated: created.length };
};
