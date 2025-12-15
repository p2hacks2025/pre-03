import { createLogger, type LogLevel } from "@packages/logger";
import type { Context, Next } from "hono";
import type { Bindings, Variables } from "@/context";

/**
 * ロガーミドルウェア
 * リクエストごとに requestId を持つ子ロガーを注入
 * envMiddleware の後に適用すること
 */
export const loggerMiddleware = async (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next,
) => {
  const env = c.get("env");

  const baseLogger = createLogger({
    level: env.LOG_LEVEL as LogLevel | undefined,
    isProduction: env.ENVIRONMENT === "production",
  });

  const requestId = c.req.header("X-Request-ID") ?? crypto.randomUUID();

  // requestId を持つ子ロガーを作成
  const logger = baseLogger.child({
    requestId,
    method: c.req.method,
    path: c.req.path,
  });

  c.set("logger", logger);
  logger.info("Request started");

  const startTime = Date.now();

  try {
    await next();
  } finally {
    const durationMs = Date.now() - startTime;
    const status = c.res.status;

    if (status >= 500) {
      logger.error("Request completed", { status, durationMs });
    } else if (status >= 400) {
      logger.warn("Request completed", { status, durationMs });
    } else {
      logger.info("Request completed", { status, durationMs });
    }
  }
};
