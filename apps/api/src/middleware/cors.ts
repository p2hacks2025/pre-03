import type { Context, Next } from "hono";
import { cors } from "hono/cors";
import type { Bindings, Variables } from "@/context";

const DEFAULT_ORIGINS = ["http://localhost:4000"];

/**
 * Originがマッチするか判定し、マッチした場合はoriginを返す
 * エラーハンドラからも使用可能
 */
export const getCorsOrigin = (
  origin: string | undefined,
  env: { ALLOWED_ORIGINS?: string } | undefined,
): string | null => {
  if (!origin) return null;

  const allowedOrigins = env?.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : DEFAULT_ORIGINS;

  for (const pattern of allowedOrigins) {
    // ワイルドカード
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1);
      if (origin.endsWith(suffix) || origin === `https://${pattern.slice(2)}`) {
        return origin;
      }
    }
    // 完全一致
    else if (pattern === origin) {
      return origin;
    }
  }

  return null;
};

/**
 * ワイルドカードパターンをサポートするCORSミドルウェア
 *
 * credentials: "include" 使用時の制約:
 * - Access-Control-Allow-Origin: * は使用不可
 * - Access-Control-Allow-Credentials: true が必須
 */
export const corsMiddleware = async (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next,
) => {
  const env = c.get("env");

  return cors({
    origin: (origin) => getCorsOrigin(origin, env),
    credentials: true,
  })(c, next);
};
