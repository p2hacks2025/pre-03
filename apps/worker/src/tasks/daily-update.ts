import { GoogleGenAI } from "@google/genai";
import {
  getGuideImageBase64,
  getSystemPrompt,
  JST_OFFSET,
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

export const generateImage = async (
  ctx: WorkerContext,
  currentImageBase64: string,
  fieldId: number,
  diaryContent: string,
): Promise<Buffer> => {
  const ai = new GoogleGenAI({ apiKey: ctx.env.GOOGLE_API_KEY });
  const systemPrompt = getSystemPrompt();
  const guideImageBase64 = getGuideImageBase64(fieldId);

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/png", data: currentImageBase64 } },
          { inlineData: { mimeType: "image/png", data: guideImageBase64 } },
          { text: `${systemPrompt}\n\n---\n\nDiary:\n${diaryContent}` },
        ],
      },
    ],
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "1:1", imageSize: "2K" },
      systemInstruction: systemPrompt,
      temperature: 0.1,
      seed: 1234,
      candidateCount: 1,
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
