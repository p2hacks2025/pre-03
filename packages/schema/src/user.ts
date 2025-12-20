import { z } from "@hono/zod-openapi";
import { ProfileSchema, UserSchema } from "./auth";

/**
 * GET /user/me - 現在のユーザー情報
 */

export const GetMeOutputSchema = z
  .object({
    user: UserSchema,
    profile: ProfileSchema.nullable(),
  })
  .openapi("GetMeOutput");

export type GetMeOutput = z.infer<typeof GetMeOutputSchema>;

/**
 * POST /user/avatar - アバターアップロード
 */

// ファイルアップロード用スキーマ（@hono/zod-openapi 推奨パターン）
// 参考: https://github.com/honojs/middleware/issues/674
export const UploadAvatarInputSchema = z
  .object({
    file: z
      .custom<File>((v) => v instanceof File)
      .openapi({
        type: "string",
        format: "binary",
        description: "アバター画像ファイル（JPEG/PNG/WebP、最大5MB）",
      }),
  })
  .openapi("UploadAvatarInput");

export type UploadAvatarInput = z.infer<typeof UploadAvatarInputSchema>;

export const UploadAvatarOutputSchema = z
  .object({
    avatarUrl: z.url().openapi({
      example:
        "https://xxx.supabase.co/storage/v1/object/public/avatars/user-id/1234567890.png",
    }),
  })
  .openapi("UploadAvatarOutput");

export type UploadAvatarOutput = z.infer<typeof UploadAvatarOutputSchema>;

/**
 * PATCH /user/profile - プロフィール更新（将来の拡張用）
 */

export const UpdateProfileInputSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "表示名は必須です")
      .max(50, "表示名は50文字以内で入力してください")
      .optional(),
  })
  .openapi("UpdateProfileInput");

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export const UpdateProfileOutputSchema = z
  .object({
    profile: ProfileSchema,
  })
  .openapi("UpdateProfileOutput");

export type UpdateProfileOutput = z.infer<typeof UpdateProfileOutputSchema>;

/**
 * GET /user/stats - プロフィール統計情報
 */

export const GetProfileStatsOutputSchema = z
  .object({
    totalPosts: z.number().int().min(0).openapi({
      description: "ユーザーの総投稿数",
      example: 100,
    }),
    worldCount: z.number().int().min(0).openapi({
      description: "作られた世界の数",
      example: 10,
    }),
    streakDays: z.number().int().min(0).openapi({
      description: "連続投稿日数",
      example: 9,
    }),
  })
  .openapi("GetProfileStatsOutput");

export type GetProfileStatsOutput = z.infer<typeof GetProfileStatsOutputSchema>;
