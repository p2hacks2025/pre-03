import type { Hyperdrive } from "@cloudflare/workers-types";
import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { DbClient } from "@packages/db";
import type { Logger } from "@packages/logger";
import type {
  SupabaseClient,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import type { ApiEnv } from "@/config/env";

export type Bindings = {
  HYPERDRIVE: Hyperdrive;
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ALLOWED_ORIGINS?: string;
  ENVIRONMENT?: string;
  LOG_LEVEL?: string;
};

export type Variables = {
  db: DbClient;
  env: ApiEnv;
  supabase: SupabaseClient;
  user: SupabaseUser;
  logger: Logger;
};

export type AppEnv = { Bindings: Bindings; Variables: Variables };

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>;
