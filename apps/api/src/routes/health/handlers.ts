import type { AppRouteHandler } from "@/context";
import { AppError } from "@/shared/error/app-error";
import type { dbHealthRoute, healthRoute } from "./route";

export const healthHandler: AppRouteHandler<typeof healthRoute> = (c) => {
  const env = c.get("env");
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT,
  });
};

export const dbHealthHandler: AppRouteHandler<typeof dbHealthRoute> = async (
  c,
) => {
  try {
    const db = c.get("db");
    // データベース接続確認（SELECT 1クエリ実行）
    await db.execute("SELECT 1");

    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    throw new AppError("INTERNAL_SERVER_ERROR", {
      message: "Database is unhealthy.",
      cause: error instanceof Error ? error : undefined,
    });
  }
};
