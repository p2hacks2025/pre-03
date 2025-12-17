import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ASSETS_DIR } from "./constants";

export const getSystemPrompt = (): string => {
  return readFileSync(resolve(ASSETS_DIR, "prompts/system_prompt.md"), "utf-8");
};

export const getGuideImageBase64 = (fieldId: number): string => {
  const guidePath = resolve(ASSETS_DIR, `images/guides/guide${fieldId}.png`);
  const buffer = readFileSync(guidePath);
  return buffer.toString("base64");
};
