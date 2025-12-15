import { z } from "zod";

export const webServerKeys = {
  ENVIRONMENT: z.enum(["development", "staging", "production"]).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).optional(),
};

export const webClientKeys = {
  NEXT_PUBLIC_API_BASE_URL: z.url(),
};

export type WebServerKeys = typeof webServerKeys;
export type WebClientKeys = typeof webClientKeys;
