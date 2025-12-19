import { createRoute } from "@hono/zod-openapi";
import {
  GetDateUpdateOutputSchema,
  GetReflectionCalendarInputSchema,
  GetReflectionCalendarOutputSchema,
  GetWeeklyWorldInputSchema,
  GetWeeklyWorldOutputSchema,
} from "@packages/schema/reflection";
import { authMiddleware } from "@/middleware/auth";
import { dbMiddleware } from "@/middleware/db";
import { DefaultErrorResponses } from "@/shared/error/error-openapi";

export const getReflectionCalendarRoute = createRoute({
  method: "get",
  path: "/calendar",
  middleware: [authMiddleware, dbMiddleware] as const,
  request: {
    query: GetReflectionCalendarInputSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": { schema: GetReflectionCalendarOutputSchema },
      },
      description: "リフレクションカレンダー取得成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Reflection"],
});

export const getDateUpdateRoute = createRoute({
  method: "get",
  path: "/date-update",
  middleware: [authMiddleware, dbMiddleware] as const,
  responses: {
    200: {
      content: {
        "application/json": { schema: GetDateUpdateOutputSchema },
      },
      description: "日付更新チェック成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Reflection"],
});

export const getWeeklyWorldRoute = createRoute({
  method: "get",
  path: "/weekly-world",
  middleware: [authMiddleware, dbMiddleware] as const,
  request: {
    query: GetWeeklyWorldInputSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": { schema: GetWeeklyWorldOutputSchema },
      },
      description: "週間世界詳細取得成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Reflection"],
});
