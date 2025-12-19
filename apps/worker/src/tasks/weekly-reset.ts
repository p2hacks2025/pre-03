import type { UserPost, UserProfile } from "@packages/db";
import OpenAI from "openai";
import {
  createOrUpdateWorldBuildLog,
  createWeeklyWorld,
  FIELD_ID_MAX,
  FIELD_ID_MIN,
  findWeeklyWorld,
  getAllUserProfiles,
  getBaseImageBase64,
  getBaseImageBuffer,
  getUserPostsForWeek,
  getWeeklySummaryPrompt,
  uploadGeneratedImage,
  type WorkerContext,
} from "@/lib";
import {
  fetchImageAsBase64,
  generateImage,
  getJstToday,
  getWeekStartDate,
} from "./daily-update";

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

export const fetchAllUserProfiles = async (
  ctx: WorkerContext,
): Promise<UserProfile[]> => {
  return getAllUserProfiles(ctx);
};

export const fetchUserPostsForWeek = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
): Promise<UserPost[]> => {
  return getUserPostsForWeek(ctx, userProfileId, weekStartDate);
};

export const findWeeklyWorldForUser = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
) => {
  return findWeeklyWorld(ctx, userProfileId, weekStartDate);
};

export const processUserWeeklyResetWithPosts = async (
  ctx: WorkerContext,
  profile: UserProfile,
  posts: UserPost[],
  newWeekStart: Date,
): Promise<string> => {
  const summary = await summarizePostsWithLLM(ctx, posts);
  const fieldIds = selectRandomFieldIds(2);

  let currentImageBase64 = getBaseImageBase64();

  const firstImageBuffer = await generateImage(
    ctx,
    currentImageBase64,
    fieldIds[0],
    summary,
  );

  const firstImageUrl = await uploadGeneratedImage(
    ctx,
    profile.id,
    newWeekStart,
    firstImageBuffer,
  );
  currentImageBase64 = await fetchImageAsBase64(firstImageUrl);

  const secondImageBuffer = await generateImage(
    ctx,
    currentImageBase64,
    fieldIds[1],
    summary,
  );

  const initialImageUrl = await uploadGeneratedImage(
    ctx,
    profile.id,
    newWeekStart,
    secondImageBuffer,
  );

  const newWeeklyWorld = await createWeeklyWorld(
    ctx,
    profile.id,
    newWeekStart,
    initialImageUrl,
  );

  const today = new Date();
  for (const fieldId of fieldIds) {
    await createOrUpdateWorldBuildLog(
      ctx,
      newWeeklyWorld.id,
      fieldId,
      today,
      false,
    );
  }

  return initialImageUrl;
};

export const processUserWeeklyResetWithoutPosts = async (
  ctx: WorkerContext,
  profile: UserProfile,
  newWeekStart: Date,
): Promise<string> => {
  const initialImageUrl = await uploadGeneratedImage(
    ctx,
    profile.id,
    newWeekStart,
    getBaseImageBuffer(),
  );

  await createWeeklyWorld(ctx, profile.id, newWeekStart, initialImageUrl);

  return initialImageUrl;
};
