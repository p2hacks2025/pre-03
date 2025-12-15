import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "@/config/router";

// レスポンススキーマ
const MessageSchema = z.object({
  message: z.string().openapi({
    example: "Hello from Hono API!",
  }),
});

// ルート定義
const rootRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MessageSchema,
        },
      },
      description: "Root endpoint",
    },
  },
  tags: ["General"],
});

// ルーター作成
export const rootRouter = createRouter().openapi(rootRoute, (c) => {
  return c.json({ message: "Hello from Hono API!" });
});
