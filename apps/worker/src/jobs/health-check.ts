import type { WorkerContext } from "@/lib";
import { checkDb, checkSupabase, type HealthCheckResult } from "@/tasks";

export type HealthCheckJobResult = {
  success: boolean;
  checks: {
    db: HealthCheckResult;
    supabase: HealthCheckResult;
  };
};

/**
 * 全ヘルスチェックを実行するジョブ
 */
export const healthCheck = async (
  ctx: WorkerContext,
): Promise<HealthCheckJobResult> => {
  ctx.logger.info("=== Starting health-check job ===");

  const dbResult = await checkDb(ctx);
  const supabaseResult = await checkSupabase(ctx);

  const success = dbResult.status === "ok" && supabaseResult.status === "ok";

  if (success) {
    ctx.logger.info("=== health-check job completed: ALL OK ===");
  } else {
    ctx.logger.warn("=== health-check job completed: SOME FAILED ===", {
      db: dbResult.status,
      supabase: supabaseResult.status,
    });
  }

  return {
    success,
    checks: {
      db: dbResult,
      supabase: supabaseResult,
    },
  };
};
