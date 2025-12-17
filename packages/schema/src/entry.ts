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
