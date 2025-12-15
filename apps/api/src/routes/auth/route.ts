import { createRoute } from "@hono/zod-openapi";
import {
  LoginInputSchema,
  LoginOutputSchema,
  LogoutOutputSchema,
  PasswordResetInputSchema,
  PasswordResetOutputSchema,
  SignupInputSchema,
  SignupOutputSchema,
} from "@packages/schema/auth";
import { authMiddleware } from "@/middleware/auth";
import { dbMiddleware } from "@/middleware/db";
import { DefaultErrorResponses } from "@/shared/error/error-openapi";

export const signupRoute = createRoute({
  method: "post",
  path: "/signup",
  middleware: [dbMiddleware] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignupInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SignupOutputSchema,
        },
      },
      description: "ユーザー登録成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Auth"],
});

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoginOutputSchema,
        },
      },
      description: "ログイン成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Auth"],
});

export const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  middleware: [authMiddleware] as const,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LogoutOutputSchema,
        },
      },
      description: "ログアウト成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Auth"],
});

export const passwordResetRoute = createRoute({
  method: "post",
  path: "/password/reset",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PasswordResetInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PasswordResetOutputSchema,
        },
      },
      description: "パスワードリセットメール送信成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Auth"],
});
