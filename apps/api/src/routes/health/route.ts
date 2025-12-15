import { createRoute } from "@hono/zod-openapi";
import {
  GetDbHealthOutputSchema,
  GetHealthOutputSchema,
} from "@packages/schema/health";
import { dbMiddleware } from "@/middleware/db";
import { DefaultErrorResponses } from "@/shared/error/error-openapi";

export const healthRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GetHealthOutputSchema,
        },
      },
      description: "Health check status",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Health"],
});

export const dbHealthRoute = createRoute({
  method: "get",
  path: "/db",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GetDbHealthOutputSchema,
        },
      },
      description: "Database health check status",
    },
    ...DefaultErrorResponses,
  },
  middleware: [dbMiddleware] as const,
  tags: ["Health"],
});
