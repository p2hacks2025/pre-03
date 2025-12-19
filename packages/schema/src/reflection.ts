import { z } from "@hono/zod-openapi";

/**
 * カレンダー週データ
 */
export const CalendarWeekSchema = z
  .object({
    weekStartDate: z.iso.date().openapi({
      description: "週の開始日（月曜日、YYYY-MM-DD形式）",
      example: "2025-12-01",
    }),
    weeklyWorldImageUrl: z.url().nullable().openapi({
      description: "週のワールド画像URL（未生成の場合はnull）",
      example:
        "https://xxx.supabase.co/storage/v1/object/public/worlds/user-id/2025-12-01.png",
    }),
  })
  .openapi("CalendarWeek");

export type CalendarWeek = z.infer<typeof CalendarWeekSchema>;

/**
 * GET /reflection/calendar - リフレクションカレンダー取得
 */
export const GetReflectionCalendarInputSchema = z
  .object({
    year: z.coerce
      .number()
      .int()
      .min(2000, "年は2000以上を指定してください")
      .max(2100, "年は2100以下を指定してください")
      .openapi({
        description: "取得する年（2000-2100）",
        example: 2025,
      }),
    month: z.coerce
      .number()
      .int()
      .min(1, "月は1以上を指定してください")
      .max(12, "月は12以下を指定してください")
      .openapi({
        description: "取得する月（1-12）",
        example: 12,
      }),
  })
  .openapi("GetReflectionCalendarInput");

export type GetReflectionCalendarInput = z.infer<
  typeof GetReflectionCalendarInputSchema
>;

export const GetReflectionCalendarOutputSchema = z
  .object({
    year: z.number().int().openapi({
      description: "年",
      example: 2025,
    }),
    month: z.number().int().openapi({
      description: "月",
      example: 12,
    }),
    weeks: z.array(CalendarWeekSchema).openapi({
      description:
        "その月に含まれる週のリスト（月の1日を含む週から、月末を含む週まで）",
    }),
    entryDates: z.array(z.iso.date()).openapi({
      description:
        "その月に日記を投稿した日のリスト（YYYY-MM-DD形式、重複なし、昇順）",
      example: ["2025-12-01", "2025-12-05", "2025-12-10"],
    }),
  })
  .openapi("GetReflectionCalendarOutput");

export type GetReflectionCalendarOutput = z.infer<
  typeof GetReflectionCalendarOutputSchema
>;

/**
 * 日付更新ステータス
 */
export const DateUpdateStatusSchema = z
  .enum(["no_update", "daily_update", "weekly_update"])
  .openapi("DateUpdateStatus");

export type DateUpdateStatus = z.infer<typeof DateUpdateStatusSchema>;

/**
 * 日付更新情報（画像URLのみ）
 */
export const DateUpdateInfoSchema = z
  .object({
    imageUrl: z.url().nullable().openapi({
      description: "ワールド画像URL",
      example:
        "https://xxx.supabase.co/storage/v1/object/public/worlds/user-id/2025-12-01.png",
    }),
  })
  .openapi("DateUpdateInfo");

export type DateUpdateInfo = z.infer<typeof DateUpdateInfoSchema>;

/**
 * GET /reflection/date-update - 日付更新チェック
 */
export const GetDateUpdateOutputSchema = z
  .object({
    date: z.iso.date().openapi({
      description: "JST基準の今日の日付（YYYY-MM-DD形式）",
      example: "2025-12-19",
    }),
    status: DateUpdateStatusSchema.openapi({
      description: "更新ステータス",
      example: "daily_update",
    }),
    daily: DateUpdateInfoSchema.nullable().openapi({
      description: "デイリー更新情報（今週のワールド画像）",
    }),
    weekly: DateUpdateInfoSchema.nullable().openapi({
      description: "ウィークリー更新情報（前週のワールド画像）",
    }),
  })
  .openapi("GetDateUpdateOutput");

export type GetDateUpdateOutput = z.infer<typeof GetDateUpdateOutputSchema>;
