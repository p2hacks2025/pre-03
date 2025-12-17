import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import {
  and,
  eq,
  gte,
  isNull,
  lt,
  type UserPost,
  userPosts,
  type WeeklyWorld,
  weeklyWorlds,
  worldBuildLogs,
} from "@packages/db";
import sharp from "sharp";
import { getSystemPrompt, type WorkerContext } from "@/lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(__dirname, "../../assets");
const FIELD_ID_MIN = 0;
const FIELD_ID_MAX = 8;

export type UserPostsGroupedByUser = {
  userProfileId: string;
  posts: UserPost[];
};

const JST_OFFSET = 9 * 60 * 60 * 1000;

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

export const getGuideImageBase64 = (fieldId: number): string => {
  const guidePath = resolve(ASSETS_DIR, `images/guides/guide${fieldId}.png`);
  const buffer = readFileSync(guidePath);
  return buffer.toString("base64");
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

export const removeWhiteBackground = async (
  imageBuffer: Buffer,
): Promise<Buffer> => {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 230;
  const pixels = new Uint8Array(data);
  const { width, height } = info;
  const visited = new Uint8Array(width * height);

  const isWhite = (idx: number) => {
    const r = pixels[idx * 4];
    const g = pixels[idx * 4 + 1];
    const b = pixels[idx * 4 + 2];
    return r >= threshold && g >= threshold && b >= threshold;
  };

  const floodFill = (startX: number, startY: number) => {
    const stack: [number, number][] = [[startX, startY]];

    while (stack.length > 0) {
      const item = stack.pop();
      if (!item) continue;
      const [x, y] = item;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const idx = y * width + x;
      if (visited[idx] || !isWhite(idx)) continue;

      visited[idx] = 1;
      pixels[idx * 4 + 3] = 0;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  };

  for (let x = 0; x < width; x++) {
    floodFill(x, 0);
    floodFill(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    floodFill(0, y);
    floodFill(width - 1, y);
  }

  return sharp(Buffer.from(pixels), {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();
};

export const generateImage = async (
  ctx: WorkerContext,
  currentImageBase64: string,
  guideImageBase64: string,
  diaryContent: string,
): Promise<Buffer> => {
  const ai = new GoogleGenAI({ apiKey: ctx.env.GOOGLE_API_KEY });
  const systemPrompt = getSystemPrompt();

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

export const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
};
