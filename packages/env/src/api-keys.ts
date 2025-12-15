import { z } from "zod";
import { dbKeys } from "./db-keys";

export const apiKeys = {
  ...dbKeys,
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  ALLOWED_ORIGINS: z.string().min(1).optional(),
  ENVIRONMENT: z.enum(["development", "staging", "production"]).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).optional(),
};

export type ApiKeys = typeof apiKeys;
