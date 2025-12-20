import type { AiProfile, UserPost } from "@packages/db";
import OpenAI from "openai";
import {
  createAiPost,
  getAiPostGenerationPrompt,
  getAiPostStandalonePrompt,
  getRandomAiProfile,
  getRandomHistoricalPosts,
  getRecentUserPosts,
  hasExistingAiPost,
  interpolatePrompt,
  LLM_CONFIG,
  type WorkerContext,
} from "@/lib";

// Constants
export const AI_POST_CONFIG = {
  SHORT_TERM_MINUTES: 30,
  LONG_TERM_EXCLUDE_DAYS: 7,
  LONG_TERM_FETCH_COUNT: 10,
  SHORT_TERM_SCHEDULE_MIN: 1,
  SHORT_TERM_SCHEDULE_MAX: 30,
  LONG_TERM_SCHEDULE_MIN: 60,
  LONG_TERM_SCHEDULE_MAX: 1440,
  MAX_RETRIES: 3,
  MAX_POST_LENGTH: 50,
  MAX_INPUT_LENGTH: 1000,
  POSTS_PER_USER: 2,
  STANDALONE_POST_COUNT: 1,
  SHORT_TERM_POST_CHANCE: 0.1,
  LONG_TERM_POST_CHANCE: 0.5,
  // 頻度制御
  FREQUENCY_CHECK_WINDOW_MINUTES: 60,
  MAX_POSTS_PER_HOUR: 5,
  MIN_POSTS_PER_HOUR: 1,
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

  let generated = 0;
  for (const content of contents) {
    await createAiPost(ctx, {
      aiProfileId: aiProfile.id,
      userProfileId: group.userProfileId,
      content,
      sourceStartAt,
      sourceEndAt,
      publishedAt: getRandomPublishedAt(scheduleMin, scheduleMax),
    });
    generated++;
  }

  return { generated };
};

export const processHistoricalAiPost = async (
  ctx: WorkerContext,
  diary: UserPost,
  scheduleMin: number,
  scheduleMax: number,
): Promise<{ generated: number }> => {
  const aiProfile = await getRandomAiProfile(ctx);
  const contents = await generateAiPostContents(
    ctx,
    aiProfile,
    diary.content,
    AI_POST_CONFIG.POSTS_PER_USER,
  );
  const sourceDate = new Date(diary.createdAt);

  let generated = 0;
  for (const content of contents) {
    await createAiPost(ctx, {
      aiProfileId: aiProfile.id,
      userProfileId: diary.userProfileId,
      content,
      sourceStartAt: sourceDate,
      sourceEndAt: sourceDate,
      publishedAt: getRandomPublishedAt(scheduleMin, scheduleMax),
    });
    generated++;
  }

  return { generated };
};
