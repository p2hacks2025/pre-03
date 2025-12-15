// app-error.ts

import type {
  ErrorCode,
  ErrorDetail,
  ErrorResponse,
} from "@packages/schema/common/error";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

type ErrorDefinition = {
  status: ContentfulStatusCode;
  defaultMessage: string;
};

const ERROR_DEFINITIONS: Record<ErrorCode, ErrorDefinition> = {
  BAD_REQUEST: {
    status: 400,
    defaultMessage: "Bad request.",
  },
  UNAUTHORIZED: {
    status: 401,
    defaultMessage: "Unauthorized.",
  },
  FORBIDDEN: {
    status: 403,
    defaultMessage: "Forbidden.",
  },
  NOT_FOUND: {
    status: 404,
    defaultMessage: "Resource not found.",
  },
  CONFLICT: {
    status: 409,
    defaultMessage: "Conflict occurred.",
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    defaultMessage: "Internal server error.",
  },
} as const;

type AppErrorOptions = {
  message?: string;
  details?: ErrorDetail[];
  cause?: unknown;
};

/**
 * API 全体で使うアプリケーションエラー
 *
 * - code: ErrorCode (enum)
 * - message: デフォルト or 任意のカスタムメッセージ
 * - details: ErrorDetail[] (省略可)
 */
export class AppError extends HTTPException {
  public readonly code: ErrorCode;
  public readonly details?: ErrorDetail[];

  constructor(code: ErrorCode, options: AppErrorOptions = {}) {
    const def = ERROR_DEFINITIONS[code];

    const message = options.message ?? def.defaultMessage;
    const details = options.details;

    const body: ErrorResponse = {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    };

    const res = new Response(JSON.stringify(body), {
      status: def.status,
      headers: {
        "Content-Type": "application/json",
      },
    });

    super(def.status, {
      res,
      cause: options.cause,
    });

    this.code = code;
    this.details = details;
  }
}
