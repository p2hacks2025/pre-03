import type { AiProfile, UserPost } from "@packages/db";
import OpenAI from "openai";
import {
  createAiPost,
  getAiPostGenerationPrompt,
  getAiPostStandalonePrompt,
  getRandomAiProfile,
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
  MAX_POST_LENGTH: 140,
} as const;

export type DiaryGroup = {
  userProfileId: string;
  posts: UserPost[];
};

export type StandaloneGenerationResult = {
  generated: number;
  errors: string[];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildPrompt = (template: string, aiProfile: AiProfile): string =>
  template
    .replaceAll("{ai_profile_name}", aiProfile.username)
    .replaceAll("{ai_profile_description}", aiProfile.description);

const callOpenAIWithRetry = async (
  ctx: WorkerContext,
  messages: OpenAI.ChatCompletionMessageParam[],
  maxRetries = AI_POST_CONFIG.MAX_RETRIES,
): Promise<string> => {
  const openai = new OpenAI({ apiKey: ctx.env.OPENAI_API_KEY });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_completion_tokens: 200,
      });
      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error("No text in OpenAI response");
      return text.slice(0, AI_POST_CONFIG.MAX_POST_LENGTH);
    } catch (error) {
      const isRateLimit =
        error instanceof OpenAI.RateLimitError ||
        (error instanceof Error && error.message.includes("rate limit"));

      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = 2 ** (attempt + 1) * 1000;
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

export const generateAiPostContent = async (
  ctx: WorkerContext,
  aiProfile: AiProfile,
  diaryContent: string,
): Promise<string> => {
  const systemPrompt = buildPrompt(getAiPostGenerationPrompt(), aiProfile);
  return callOpenAIWithRetry(ctx, [
    { role: "system", content: systemPrompt },
    { role: "user", content: diaryContent },
  ]);
};

export const generateStandaloneAiPostContent = async (
  ctx: WorkerContext,
  aiProfile: AiProfile,
): Promise<string> => {
  const systemPrompt = buildPrompt(getAiPostStandalonePrompt(), aiProfile);
  return callOpenAIWithRetry(ctx, [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Please write a post." },
  ]);
};

export const generateStandalonePosts = async (
  ctx: WorkerContext,
  postCount: number,
  scheduleMin: number,
  scheduleMax: number,
): Promise<StandaloneGenerationResult> => {
  const result: StandaloneGenerationResult = { generated: 0, errors: [] };
  ctx.logger.info("Generating standalone AI posts", { postCount });

  for (let i = 0; i < postCount; i++) {
    try {
      const aiProfile = await getRandomAiProfile(ctx);
      const content = await generateStandaloneAiPostContent(ctx, aiProfile);
      const now = new Date();
      await createAiPost(ctx, {
        aiProfileId: aiProfile.id,
        userProfileId: null,
        content,
        sourceStartAt: now,
        sourceEndAt: now,
        scheduledAt: getRandomScheduledAt(scheduleMin, scheduleMax),
      });
      result.generated++;
    } catch (error) {
      result.errors.push(`Standalone: ${(error as Error).message}`);
      ctx.logger.error(
        "Failed to generate standalone post",
        {},
        error as Error,
      );
    }
  }
  return result;
};

export const getRandomScheduledAt = (min: number, max: number): Date =>
  new Date(
    Date.now() +
      (Math.floor(Math.random() * (max - min + 1)) + min) * 60 * 1000,
  );

export const determinePostCount = (contentLength: number): number => {
  if (contentLength <= 100) return 1;
  if (contentLength <= 300) return Math.random() < 0.5 ? 1 : 2;
  return Math.random() < 0.5 ? 2 : 3;
};

export const determineStandalonePostCount = (isLongTerm: boolean): number =>
  isLongTerm ? Math.floor(Math.random() * 3) + 1 : Math.random() < 0.5 ? 1 : 2;
