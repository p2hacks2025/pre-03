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

/**
 * AIプロフィール（週間世界詳細用）
 */
export const AiProfileSummarySchema = z
  .object({
    id: z.uuid().openapi({
      description: "AIプロフィールID",
      example: "550e8400-e29b-41d4-a716-446655440000",
    }),
    username: z.string().openapi({
      description: "AI名",
      example: "ゆめみ",
    }),
    avatarUrl: z.url().nullable().openapi({
      description: "AIアバター画像URL",
      example:
        "https://xxx.supabase.co/storage/v1/object/public/avatars/ai/yumemi.png",
    }),
    description: z.string().openapi({
      description: "AIの説明",
      example: "あなたの日記を見守るAI",
    }),
  })
  .openapi("AiProfileSummary");

export type AiProfileSummary = z.infer<typeof AiProfileSummarySchema>;

/**
 * AI投稿（プロフィール付き）
 */
export const AiPostWithProfileSchema = z
  .object({
    id: z.uuid().openapi({
      description: "AI投稿ID",
      example: "550e8400-e29b-41d4-a716-446655440001",
    }),
    content: z.string().openapi({
      description: "AI投稿内容",
      example: "素敵な一週間でしたね！",
    }),
    imageUrl: z.url().nullable().openapi({
      description: "AI投稿画像URL",
      example:
        "https://xxx.supabase.co/storage/v1/object/public/ai-posts/xxx.png",
    }),
    sourceStartAt: z.iso.datetime().openapi({
      description: "ソース期間開始（UTC）",
      example: "2025-12-01T00:00:00.000Z",
    }),
    sourceEndAt: z.iso.datetime().openapi({
      description: "ソース期間終了（UTC）",
      example: "2025-12-08T00:00:00.000Z",
    }),
    createdAt: z.iso.datetime().openapi({
      description: "作成日時（UTC）",
      example: "2025-12-07T15:00:00.000Z",
    }),
    aiProfile: AiProfileSummarySchema.openapi({
      description: "AIプロフィール情報",
    }),
  })
  .openapi("AiPostWithProfile");

export type AiPostWithProfile = z.infer<typeof AiPostWithProfileSchema>;

/**
 * ユーザー投稿（週間世界詳細用）
 */
export const UserPostSummarySchema = z
  .object({
    id: z.uuid().openapi({
      description: "投稿ID",
      example: "550e8400-e29b-41d4-a716-446655440002",
    }),
    content: z.string().openapi({
      description: "投稿内容",
      example: "今日は良い天気でした。",
    }),
    uploadImageUrl: z.url().nullable().openapi({
      description: "添付画像URL",
      example:
        "https://xxx.supabase.co/storage/v1/object/public/entries/xxx.png",
    }),
    createdAt: z.iso.datetime().openapi({
      description: "作成日時（UTC）",
      example: "2025-12-01T09:00:00.000Z",
    }),
  })
  .openapi("UserPostSummary");

export type UserPostSummary = z.infer<typeof UserPostSummarySchema>;

/**
 * 週間世界詳細
 */
export const WeeklyWorldDetailSchema = z
  .object({
    id: z.uuid().openapi({
      description: "週間世界ID",
      example: "550e8400-e29b-41d4-a716-446655440003",
    }),
    weekStartDate: z.iso.date().openapi({
      description: "週の開始日（月曜日、YYYY-MM-DD形式）",
      example: "2025-12-01",
    }),
    weeklyWorldImageUrl: z.url().openapi({
      description: "週のワールド画像URL",
      example:
        "https://xxx.supabase.co/storage/v1/object/public/worlds/xxx.png",
    }),
    createdAt: z.iso.datetime().openapi({
      description: "作成日時（UTC）",
      example: "2025-12-07T15:00:00.000Z",
    }),
    updatedAt: z.iso.datetime().openapi({
      description: "更新日時（UTC）",
      example: "2025-12-07T15:00:00.000Z",
    }),
  })
  .openapi("WeeklyWorldDetail");

export type WeeklyWorldDetail = z.infer<typeof WeeklyWorldDetailSchema>;

/**
 * GET /reflection/weekly-world - 週間世界詳細取得
 */
export const GetWeeklyWorldInputSchema = z
  .object({
    weekStartDate: z.iso.date().openapi({
      description: "週の開始日（月曜日、YYYY-MM-DD形式）",
      example: "2025-12-01",
    }),
  })
  .openapi("GetWeeklyWorldInput");

export type GetWeeklyWorldInput = z.infer<typeof GetWeeklyWorldInputSchema>;

export const GetWeeklyWorldOutputSchema = z
  .object({
    weeklyWorld: WeeklyWorldDetailSchema.openapi({
      description: "週間世界情報",
    }),
    userPosts: z.array(UserPostSummarySchema).openapi({
      description: "その週のユーザー日記一覧（作成日時昇順）",
    }),
    aiPosts: z.array(AiPostWithProfileSchema).openapi({
      description: "その週のAI投稿一覧（作成日時昇順）",
    }),
  })
  .openapi("GetWeeklyWorldOutput");

export type GetWeeklyWorldOutput = z.infer<typeof GetWeeklyWorldOutputSchema>;
