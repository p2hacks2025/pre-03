import { z } from "@hono/zod-openapi";

/**
 * POST /notifications/send - 通知送信
 */

export const SendNotificationInputSchema = z
  .object({
    title: z
      .string()
      .min(1, "タイトルは必須です")
      .max(100, "タイトルは100文字以内で入力してください")
      .openapi({ example: "新しいメッセージ" }),
    message: z
      .string()
      .min(1, "メッセージは必須です")
      .max(500, "メッセージは500文字以内で入力してください")
      .openapi({ example: "新しい通知があります" }),
    externalUserIds: z
      .array(z.string())
      .optional()
      .openapi({
        description: "特定ユーザーに送信する場合のユーザーID配列",
        example: ["user-123", "user-456"],
      }),
    segment: z.string().optional().openapi({
      description:
        "OneSignal セグメント名（externalUserIds が未指定の場合に使用）",
      example: "Subscribed Users",
    }),
    data: z
      .record(z.string(), z.unknown())
      .optional()
      .openapi({
        description: "通知に付加するカスタムデータ",
        example: { type: "message", id: "123" },
      }),
  })
  .openapi("SendNotificationInput");

export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

export const SendNotificationOutputSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    notificationId: z.string().optional().openapi({
      description: "OneSignal が発行した通知ID",
      example: "abc123",
    }),
    recipients: z.number().optional().openapi({
      description: "通知を受信する予定のデバイス数",
      example: 10,
    }),
  })
  .openapi("SendNotificationOutput");

export type SendNotificationOutput = z.infer<
  typeof SendNotificationOutputSchema
>;
