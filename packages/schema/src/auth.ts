import { z } from "@hono/zod-openapi";

/**
 * Base Schemas
 */

export const UserSchema = z
  .object({
    id: z.uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    email: z.email().openapi({ example: "user@example.com" }),
    createdAt: z.iso.datetime().openapi({
      example: "2024-01-01T00:00:00.000Z",
    }),
  })
  .openapi("User");

export type User = z.infer<typeof UserSchema>;

export const ProfileSchema = z
  .object({
    id: z.uuid().openapi({ example: "660e8400-e29b-41d4-a716-446655440001" }),
    userId: z
      .uuid()
      .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    displayName: z.string().openapi({ example: "John Doe" }),
    avatarUrl: z
      .url()
      .nullable()
      .openapi({ example: "https://example.com/avatar.png" }),
    createdAt: z.iso.datetime().openapi({
      example: "2024-01-01T00:00:00.000Z",
    }),
  })
  .openapi("Profile");

export type Profile = z.infer<typeof ProfileSchema>;

export const SessionSchema = z
  .object({
    accessToken: z.string().openapi({
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
    refreshToken: z.string().openapi({
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
    expiresAt: z.number().openapi({ example: 1704067200 }),
  })
  .openapi("Session");

export type Session = z.infer<typeof SessionSchema>;

/**
 * POST /auth/signup
 */

export const SignupInputSchema = z
  .object({
    email: z.email().openapi({ example: "user@example.com" }),
    password: z
      .string()
      .min(8, "パスワードは8文字以上である必要があります")
      .openapi({ example: "securePassword123" }),
    displayName: z
      .string()
      .min(1, "表示名は必須です")
      .max(50, "表示名は50文字以内で入力してください")
      .openapi({ example: "山田太郎" }),
  })
  .openapi("SignupInput");

export type SignupInput = z.infer<typeof SignupInputSchema>;

export const SignupOutputSchema = z
  .object({
    user: UserSchema,
    session: SessionSchema,
  })
  .openapi("SignupOutput");

export type SignupOutput = z.infer<typeof SignupOutputSchema>;

/**
 * POST /auth/login
 */

export const LoginInputSchema = z
  .object({
    email: z.email().openapi({ example: "user@example.com" }),
    password: z.string().openapi({ example: "securePassword123" }),
  })
  .openapi("LoginInput");

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const LoginOutputSchema = z
  .object({
    user: UserSchema,
    session: SessionSchema,
  })
  .openapi("LoginOutput");

export type LoginOutput = z.infer<typeof LoginOutputSchema>;

/**
 * POST /auth/logout
 */

export const LogoutOutputSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
  })
  .openapi("LogoutOutput");

export type LogoutOutput = z.infer<typeof LogoutOutputSchema>;

/**
 * POST /auth/password/reset
 */

export const PasswordResetInputSchema = z
  .object({
    email: z.email().openapi({ example: "user@example.com" }),
  })
  .openapi("PasswordResetInput");

export type PasswordResetInput = z.infer<typeof PasswordResetInputSchema>;

export const PasswordResetOutputSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    message: z
      .string()
      .openapi({ example: "パスワードリセットメールを送信しました" }),
  })
  .openapi("PasswordResetOutput");

export type PasswordResetOutput = z.infer<typeof PasswordResetOutputSchema>;

/**
 * POST /auth/refresh
 */

export const RefreshTokenInputSchema = z
  .object({
    refreshToken: z.string().optional().openapi({
      description: "Native アプリ用。Web は Cookie から取得するため省略可",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
  })
  .openapi("RefreshTokenInput");

export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

export const RefreshTokenOutputSchema = z
  .object({
    session: SessionSchema,
  })
  .openapi("RefreshTokenOutput");

export type RefreshTokenOutput = z.infer<typeof RefreshTokenOutputSchema>;
