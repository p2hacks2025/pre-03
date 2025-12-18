import type { AiProfile, UserPost } from "@packages/db";
import OpenAI from "openai";
import {
  getAiPostGenerationPrompt,
  getAiPostStandalonePrompt,
  type WorkerContext,
} from "@/lib";

export type DiaryGroup = {
  userProfileId: string;
  posts: UserPost[];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const callOpenAIWithRetry = async (
  ctx: WorkerContext,
  messages: OpenAI.ChatCompletionMessageParam[],
  maxRetries = 3,
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
      return text.slice(0, 140);
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
  const systemPrompt = getAiPostGenerationPrompt()
    .replace("{ai_profile_name}", aiProfile.username)
    .replace("{ai_profile_description}", aiProfile.description);

  return callOpenAIWithRetry(ctx, [
    { role: "system", content: systemPrompt },
    { role: "user", content: diaryContent },
  ]);
};

export const generateStandaloneAiPostContent = async (
  ctx: WorkerContext,
  aiProfile: AiProfile,
): Promise<string> => {
  const systemPrompt = getAiPostStandalonePrompt()
    .replace("{ai_profile_name}", aiProfile.username)
    .replace("{ai_profile_description}", aiProfile.description);

  return callOpenAIWithRetry(ctx, [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Please write a post." },
  ]);
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
