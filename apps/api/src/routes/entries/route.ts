import { createRoute } from "@hono/zod-openapi";
import {
  CreateEntryInputSchema,
  CreateEntryOutputSchema,
} from "@packages/schema/entry";
import { authMiddleware } from "@/middleware/auth";
import { dbMiddleware } from "@/middleware/db";
import { DefaultErrorResponses } from "@/shared/error/error-openapi";

export const createEntryRoute = createRoute({
  method: "post",
  path: "/",
  middleware: [authMiddleware, dbMiddleware] as const,
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: CreateEntryInputSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CreateEntryOutputSchema,
        },
      },
      description: "日記投稿成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Entries"],
});
