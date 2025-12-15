import { webClientKeys, webServerKeys } from "@packages/env";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: webServerKeys,
  clientPrefix: "NEXT_PUBLIC_",
  client: webClientKeys,
  // 明示的に列挙してビルド時に値をインライン化させる
  runtimeEnv: {
    ENVIRONMENT: process.env.ENVIRONMENT,
    LOG_LEVEL: process.env.LOG_LEVEL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  emptyStringAsUndefined: true,
});

export type Env = typeof env;
