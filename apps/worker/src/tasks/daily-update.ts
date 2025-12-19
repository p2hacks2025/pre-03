import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import {
  createOrUpdateWorldBuildLog,
  FIELD_POSITIONS,
  getImageGenerationPrompt,
  getSceneDescriptionPrompt,
  getUserPostsByDate,
  getWeeklyWorld,
  JST_OFFSET,
  LLM_CONFIG,
  selectFieldId,
  type UserPostsGroupedByUser,
  updateWeeklyWorldImage,
  uploadGeneratedImage,
  type WorkerContext,
} from "@/lib";
import { removeWhiteBackground } from "./utils";

export const getJstToday = (): Date => {
  const now = new Date();
  const jstNow = new Date(now.getTime() + JST_OFFSET);
  return new Date(
    Date.UTC(
      jstNow.getUTCFullYear(),
      jstNow.getUTCMonth(),
      jstNow.getUTCDate(),
    ),
  );
};

export const getJstYesterday = (): Date => {
  const today = getJstToday();
  return new Date(today.getTime() - 24 * 60 * 60 * 1000);
};

export const getWeekStartDate = (targetDate: Date): Date => {
  const dayOfWeek = targetDate.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate() - daysToMonday,
    ),
  );
};

/**
 * 日記内容からシーン記述を生成する（GPT-5-nano）
 *
 * GPT-5シリーズは responses.create API を使用
 *
 * @param ctx WorkerContext
 * @param diaryContent 日記内容
 * @returns シーン記述（自然言語、最大15文字）
 */
export const generateSceneDescription = async (
  ctx: WorkerContext,
  diaryContent: string,
): Promise<string> => {
  const openai = new OpenAI({ apiKey: ctx.env.OPENAI_API_KEY });
  const systemPrompt = getSceneDescriptionPrompt();

  const response = await openai.responses.create({
    model: LLM_CONFIG.sceneDescription.model,
    input: [
      { role: "developer", content: systemPrompt },
      { role: "user", content: diaryContent },
    ],
    text: {
      format: { type: "text" },
    },
  });

  const text = response.output_text;
  if (typeof text !== "string" || text.length === 0) {
    ctx.logger.warn("Empty scene description from OpenAI", {
      response: JSON.stringify(response),
    });
    throw new Error("No text in OpenAI response for scene description");
  }

  ctx.logger.debug("Generated scene description", { sceneDescription: text });
  return text.slice(0, 15);
};

/**
 * シーン記述から画像を生成する（Gemini）
 *
 * @param ctx WorkerContext
 * @param currentImageBase64 現在の画像（Base64）
 * @param fieldId 更新対象のフィールドID
 * @param sceneDescription シーン記述（自然言語）
 * @returns 生成された画像のBuffer
 */
export const generateImage = async (
  ctx: WorkerContext,
  currentImageBase64: string,
  fieldId: number,
  sceneDescription: string,
): Promise<Buffer> => {
  const ai = new GoogleGenAI({ apiKey: ctx.env.GOOGLE_API_KEY });
  const prompt = getImageGenerationPrompt();
  const positionDescription = FIELD_POSITIONS[fieldId];
  const { model, temperature, seed, candidateCount } =
    LLM_CONFIG.imageGeneration;

  const userPrompt = `${prompt}

---

Block position: ${positionDescription}
Scene: ${sceneDescription}`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/png", data: currentImageBase64 } },
          { text: userPrompt },
        ],
      },
    ],
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "1:1", imageSize: "1K" },
      systemInstruction: prompt,
      temperature,
      seed,
      candidateCount,
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (typeof data === "string") {
    const rawBuffer = Buffer.from(data, "base64");
    return removeWhiteBackground(rawBuffer);
  }

  throw new Error("No image data in Gemini response");
};

export const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
};

export const fetchUserPostsByDate = async (
  ctx: WorkerContext,
  targetDate: Date,
): Promise<UserPostsGroupedByUser[]> => {
  return getUserPostsByDate(ctx, targetDate);
};

export const processUserDailyUpdate = async (
  ctx: WorkerContext,
  group: UserPostsGroupedByUser,
  targetDate: Date,
  weekStartDate: Date,
): Promise<void> => {
  const weeklyWorld = await getWeeklyWorld(
    ctx,
    group.userProfileId,
    weekStartDate,
  );

  const { fieldId, isOverwrite } = await selectFieldId(ctx, weeklyWorld.id);
  ctx.logger.info("Selected fieldId", { fieldId, isOverwrite });

  // Step 1: 日記からシーン記述を生成（GPT-5-nano）
  const diaryContent = group.posts.map((p) => p.content).join("\n\n");
  const sceneDescription = await generateSceneDescription(ctx, diaryContent);
  ctx.logger.info("Scene description generated", { sceneDescription });

  // Step 2: シーン記述から画像を生成（Gemini）
  const currentImageBase64 = await fetchImageAsBase64(
    weeklyWorld.weeklyWorldImageUrl,
  );
  const imageBuffer = await generateImage(
    ctx,
    currentImageBase64,
    fieldId,
    sceneDescription,
  );

  const newImageUrl = await uploadGeneratedImage(
    ctx,
    group.userProfileId,
    weekStartDate,
    imageBuffer,
  );

  await updateWeeklyWorldImage(ctx, weeklyWorld.id, newImageUrl);

  await createOrUpdateWorldBuildLog(
    ctx,
    weeklyWorld.id,
    fieldId,
    targetDate,
    isOverwrite,
  );
};
