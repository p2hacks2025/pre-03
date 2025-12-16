import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { workerKeys } from "@packages/env";
import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";

// .env ファイルを読み込み、process.env を強制上書き（direnv との競合を回避）
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../../.env");
config({ path: envPath, override: true });

export const env = createEnv({
  server: workerKeys,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export type Env = typeof env;
