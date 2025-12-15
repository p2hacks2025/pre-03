import type { Context, ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "@/context";
import { getCorsOrigin } from "@/middleware/cors";
import { AppError } from "@/shared/error/app-error";

/**
 * グローバルエラーハンドラーを作成
 */
export const createErrorHandler = (): ErrorHandler<AppEnv> => {
  return (err, c) => {
    const logger = c.get("logger");

    const { response, status, shouldLog } = resolveError(err);

    if (shouldLog && logger) {
      logger.error(
        status >= 500 ? "Server Error" : "Unexpected Error",
        buildErrorContext(err),
        err instanceof Error ? err : undefined,
      );
    } else if (shouldLog) {
      console.error("Unexpected Error (logger unavailable)", err);
    }

    // 3. CORSヘッダー付与
    addCorsHeaders(response, c);

    return response;
  };
};

const resolveError = (
  err: Error,
): { response: Response; status: number; shouldLog: boolean } => {
  if (err instanceof AppError) {
    return {
      response: err.getResponse(),
      status: err.status,
      shouldLog: err.status >= 500,
    };
  }

  if (err instanceof HTTPException) {
    return {
      response: err.getResponse(),
      status: err.status,
      shouldLog: err.status >= 500,
    };
  }

  const internal = new AppError("INTERNAL_SERVER_ERROR", { cause: err });
  return {
    response: internal.getResponse(),
    status: 500,
    shouldLog: true,
  };
};

const buildErrorContext = (err: Error): Record<string, unknown> => {
  const context: Record<string, unknown> = {
    errorType: err.name,
    message: err.message,
  };

  if (err instanceof AppError) {
    context.code = err.code;
    context.status = err.status;
    if (err.details && err.details.length > 0) {
      context.details = err.details;
    }
  } else if (err instanceof HTTPException) {
    context.status = err.status;
  }

  return context;
};

const addCorsHeaders = (response: Response, c: Context<AppEnv>): void => {
  const origin = c.req.header("Origin");
  const env = c.get("env");
  const allowedOrigin = getCorsOrigin(origin, env);

  if (allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
};
