import { apiKeys } from "@packages/env";
import { createEnv } from "@t3-oss/env-core";
import type { Bindings } from "@/context";

export type ApiEnv = ReturnType<typeof parseEnv>;

const parseEnv = (bindings: Bindings) => {
  return createEnv({
    server: apiKeys,
    runtimeEnv: {
      DATABASE_URL: bindings.DATABASE_URL,
      SUPABASE_URL: bindings.SUPABASE_URL,
      SUPABASE_ANON_KEY: bindings.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: bindings.SUPABASE_SERVICE_ROLE_KEY,
      ALLOWED_ORIGINS: bindings.ALLOWED_ORIGINS,
      ENVIRONMENT: bindings.ENVIRONMENT,
      LOG_LEVEL: bindings.LOG_LEVEL,
    },
    emptyStringAsUndefined: true,
  });
};

let cachedEnv: ApiEnv | undefined;

export const getEnv = (bindings: Bindings): ApiEnv => {
  if (!cachedEnv) {
    cachedEnv = parseEnv(bindings);
  }
  return cachedEnv;
};
