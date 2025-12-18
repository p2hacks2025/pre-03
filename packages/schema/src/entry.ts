import { z } from "@hono/zod-openapi";

/**
 * Base Schema
 */
export const EntrySchema = z
  .object({
    id: z.uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    content: z.string().openapi({ example: "今日は良い天気でした。" }),
    uploadImageUrl: z.url().nullable().openapi({
      example:
        "https://xxx.supabase.co/storage/v1/object/public/entries/profile-id/1234567890.png",
    }),
    createdAt: z.iso.datetime().openapi({
      example: "2024-01-01T00:00:00.000Z",
    }),
  })
  .openapi("Entry");

export type Entry = z.infer<typeof EntrySchema>;

/**
 * POST /entries - 日記投稿
 */
export const CreateEntryInputSchema = z
  .object({
    content: z.string().min(1, "本文は必須です").openapi({
      description: "日記本文",
      example: "今日は良い天気でした。",
    }),
    file: z
      .custom<File>((v) => v instanceof File)
      .optional()
      .openapi({
        type: "string",
        format: "binary",
        description: "添付画像ファイル（JPEG/PNG、最大5MB）",
      }),
  })
  .openapi("CreateEntryInput");

export type CreateEntryInput = z.infer<typeof CreateEntryInputSchema>;

export const CreateEntryOutputSchema = EntrySchema.openapi("CreateEntryOutput");

export type CreateEntryOutput = z.infer<typeof CreateEntryOutputSchema>;

/**
 * GET /entries/timeline - タイムライン取得
 */
export const GetTimelineInputSchema = z
  .object({
    from: z.iso.date().optional().openapi({
      description:
        "開始日（この日を含む、この日以降の日記を取得）。ISO 8601 日付形式（YYYY-MM-DD）",
      example: "2025-12-13",
    }),
    to: z.iso.date().optional().openapi({
      description:
        "終了日（この日を含む、この日以前の日記を取得）。ISO 8601 日付形式（YYYY-MM-DD）",
      example: "2025-12-21",
    }),
    cursor: z.string().optional().openapi({
      description: "ページネーションカーソル（Base64エンコード）",
    }),
    limit: z.coerce.number().int().min(1).max(50).default(20).openapi({
      description: "取得件数（1-50、デフォルト20）",
      example: 20,
    }),
  })
  .openapi("GetTimelineInput");

export type GetTimelineInput = z.infer<typeof GetTimelineInputSchema>;

export const GetTimelineOutputSchema = z
  .object({
    entries: z.array(EntrySchema).openapi({
      description: "日記一覧",
    }),
    nextCursor: z.string().nullable().openapi({
      description: "次ページのカーソル（nullの場合は次ページなし）",
    }),
    hasMore: z.boolean().openapi({
      description: "次ページの有無",
    }),
  })
  .openapi("GetTimelineOutput");

export type GetTimelineOutput = z.infer<typeof GetTimelineOutputSchema>;
