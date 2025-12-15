import { createLogger, type Logger, type LogLevel } from "@packages/logger";

import { env } from "@/env";

/**
 * Server Components / Server Actions / middleware.ts 用のロガー
 *
 * 注意: Client Components では使用しないこと
 * (env にアクセスするため)
 */
export const logger = createLogger({
  level: env.LOG_LEVEL as LogLevel | undefined,
  isProduction: env.ENVIRONMENT === "production",
});

/**
 * リクエストコンテキストを持つ子ロガーを作成
 */
export const createRequestLogger = (
  requestId: string,
  pathname: string,
): Logger => {
  return logger.child({
    requestId,
    pathname,
  });
};
