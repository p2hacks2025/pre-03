import { createRoute } from "@hono/zod-openapi";
import {
  CreateEntryInputSchema,
  CreateEntryOutputSchema,
  GetTimelineInputSchema,
  GetTimelineOutputSchema,
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

export const getTimelineRoute = createRoute({
  method: "get",
  path: "/timeline",
  middleware: [authMiddleware, dbMiddleware] as const,
  request: {
    query: GetTimelineInputSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GetTimelineOutputSchema,
        },
      },
      description: "タイムライン取得成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Entries"],
});
