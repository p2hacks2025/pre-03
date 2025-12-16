import { sql } from "@packages/db";
import type { WorkerContext } from "@/lib";

export type HealthCheckResult = {
  status: "ok" | "error";
  message: string;
  latencyMs?: number;
};

/**
 * データベース接続をテスト
 */
export const checkDb = async (
  ctx: WorkerContext,
): Promise<HealthCheckResult> => {
  const start = Date.now();
  try {
    await ctx.db.execute(sql`SELECT 1`);
    const latencyMs = Date.now() - start;
    ctx.logger.info("DB connection OK", { latencyMs });
    return { status: "ok", message: "DB connection successful", latencyMs };
  } catch (error) {
    const latencyMs = Date.now() - start;
    ctx.logger.error("DB connection failed", { latencyMs }, error as Error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      latencyMs,
    };
  }
};

/**
 * Supabase接続をテスト
 */
export const checkSupabase = async (
  ctx: WorkerContext,
): Promise<HealthCheckResult> => {
  const start = Date.now();
  try {
    // Supabase の auth.getSession() で接続テスト
    const { error } = await ctx.supabase.auth.getSession();
    const latencyMs = Date.now() - start;

    if (error) {
      ctx.logger.error("Supabase connection failed", { latencyMs, error });
      return { status: "error", message: error.message, latencyMs };
    }

    ctx.logger.info("Supabase connection OK", { latencyMs });
    return {
      status: "ok",
      message: "Supabase connection successful",
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    ctx.logger.error(
      "Supabase connection failed",
      { latencyMs },
      error as Error,
    );
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      latencyMs,
    };
  }
};
