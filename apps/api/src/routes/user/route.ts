import { createRoute } from "@hono/zod-openapi";
import {
  GetMeOutputSchema,
  UpdateProfileInputSchema,
  UpdateProfileOutputSchema,
  UploadAvatarInputSchema,
  UploadAvatarOutputSchema,
} from "@packages/schema/user";
import { authMiddleware } from "@/middleware/auth";
import { dbMiddleware } from "@/middleware/db";
import { DefaultErrorResponses } from "@/shared/error/error-openapi";

export const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  middleware: [authMiddleware, dbMiddleware] as const,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GetMeOutputSchema,
        },
      },
      description: "現在のユーザー情報",
    },
    ...DefaultErrorResponses,
  },
  tags: ["User"],
});

export const uploadAvatarRoute = createRoute({
  method: "post",
  path: "/avatar",
  middleware: [authMiddleware, dbMiddleware] as const,
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UploadAvatarInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UploadAvatarOutputSchema,
        },
      },
      description: "アバターアップロード成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["User"],
});

export const updateProfileRoute = createRoute({
  method: "post",
  path: "/profile/update",
  middleware: [authMiddleware, dbMiddleware] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateProfileInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UpdateProfileOutputSchema,
        },
      },
      description: "プロフィール更新成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["User"],
});
