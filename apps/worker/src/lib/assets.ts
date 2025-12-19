import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ASSETS_DIR } from "./constants";

export const getImageGenerationPrompt = (): string => {
  return readFileSync(
    resolve(ASSETS_DIR, "prompts/image_generation_prompt.md"),
    "utf-8",
  );
};

export const getGuideImageBase64 = (fieldId: number): string => {
  const guidePath = resolve(ASSETS_DIR, `images/guides/guide${fieldId}.png`);
  const buffer = readFileSync(guidePath);
  return buffer.toString("base64");
};

export const getBaseImageBase64 = (): string => {
  const basePath = resolve(ASSETS_DIR, "images/base.png");
  const buffer = readFileSync(basePath);
  return buffer.toString("base64");
};

export const getBaseImageBuffer = (): Buffer => {
  const basePath = resolve(ASSETS_DIR, "images/base.png");
  return readFileSync(basePath);
};

export const getWeeklySummaryPrompt = (): string => {
  return readFileSync(
    resolve(ASSETS_DIR, "prompts/weekly_summary_prompt.md"),
    "utf-8",
  );
};

export const getAiPostGenerationPrompt = (): string => {
  return readFileSync(
    resolve(ASSETS_DIR, "prompts/ai_post_generation.md"),
    "utf-8",
  );
};

export const getAiPostStandalonePrompt = (): string => {
  return readFileSync(
    resolve(ASSETS_DIR, "prompts/ai_post_standalone.md"),
    "utf-8",
  );
};

export const getSceneDescriptionPrompt = (): string => {
  return readFileSync(
    resolve(ASSETS_DIR, "prompts/scene_description.md"),
    "utf-8",
  );
};
