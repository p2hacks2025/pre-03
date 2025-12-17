import { createDbClient, type DbClient } from "@packages/db";
import { createLogger, type Logger } from "@packages/logger";
import { createClient } from "@supabase/supabase-js";
import { type Env, env } from "./env";

export type WorkerContext = {
  db: DbClient;
  logger: Logger;
  supabase: ReturnType<typeof createClient>;
  env: Env;
};

let ctx: WorkerContext | null = null;

export const getContext = (): WorkerContext => {
  if (!ctx) {
    ctx = {
      db: createDbClient(env.DATABASE_URL),
      logger: createLogger({ context: { name: "Worker" } }),
      supabase: createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY),
      env,
    };
  }
  return ctx;
};
