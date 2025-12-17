import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(__dirname, "../../assets");

export const getSystemPrompt = (): string => {
  return readFileSync(resolve(ASSETS_DIR, "prompts/system_prompt.md"), "utf-8");
};
