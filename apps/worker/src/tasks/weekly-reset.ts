import type { UserPost } from "@packages/db";
import OpenAI from "openai";
import {
  FIELD_ID_MAX,
  FIELD_ID_MIN,
  getWeeklySummaryPrompt,
  type WorkerContext,
} from "@/lib";
import { getJstToday, getWeekStartDate } from "./daily-update";

export const getTargetWeekStart = (ctx: WorkerContext): Date => {
  if (ctx.env.TARGET_WEEK_START) {
    return new Date(ctx.env.TARGET_WEEK_START);
  }

  const today = getJstToday();
  const currentWeekStart = getWeekStartDate(today);
  return new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
};

export const getNextWeekStart = (weekStartDate: Date): Date => {
  return new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
};

export const summarizePostsWithLLM = async (
  ctx: WorkerContext,
  posts: UserPost[],
): Promise<string> => {
  if (posts.length === 0) {
    return "";
  }

  const openai = new OpenAI({ apiKey: ctx.env.OPENAI_API_KEY });
  const diaryContent = posts.map((post) => post.content).join("\n\n---\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      { role: "system", content: getWeeklySummaryPrompt() },
      { role: "user", content: diaryContent },
    ],
    max_completion_tokens: 200,
  });

  const text = response.choices[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("No text in OpenAI response for summary");
  }

  return text.slice(0, 200);
};

export const selectRandomFieldIds = (count: number): number[] => {
  const allFieldIds: number[] = [];
  for (let i = FIELD_ID_MIN; i <= FIELD_ID_MAX; i++) {
    allFieldIds.push(i);
  }

  for (let i = allFieldIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allFieldIds[i], allFieldIds[j]] = [allFieldIds[j], allFieldIds[i]];
  }

  return allFieldIds.slice(0, count);
};
