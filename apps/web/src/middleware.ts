import { NextResponse } from "next/server";

import { createRequestLogger } from "@/lib/logger";

import type { NextRequest } from "next/server";

/**
 * リクエストID設定とロギングを行うミドルウェア
 */
export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  const requestId = request.headers.get("X-Request-ID") ?? crypto.randomUUID();
  const logger = createRequestLogger(requestId, pathname);

  logger.info("Request started", { method: request.method });

  const response = NextResponse.next();
  response.headers.set("X-Request-ID", requestId);

  const duration = Date.now() - startTime;
  logger.info("Request completed", { duration });

  return response;
};

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
