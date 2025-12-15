import { z } from "zod";

export const nativeClientKeys = {
  API_BASE_URL: z.string().url(),
  API_REMOTE_URL: z.string().url().optional(),
  ENVIRONMENT: z
    .enum(["development", "staging", "production", "native"])
    .optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).optional(),
};

export type NativeClientKeys = typeof nativeClientKeys;
