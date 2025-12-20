import { createLogger, type Logger, type LogLevel } from "@packages/logger";

/**
 * Client Components 用のロガー
 *
 * サーバーサイド専用の環境変数にアクセスしないため、
 * Client Components で安全に使用できる
 */
export const clientLogger = createLogger({
  level: (process.env.NODE_ENV === "development"
    ? "debug"
    : "info") as LogLevel,
  isProduction: process.env.NODE_ENV === "production",
});

export type { Logger };
