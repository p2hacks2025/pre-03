import type { WorkerContext } from "@/lib";
import { type SendNotificationResult, sendNotification } from "@/tasks";

export type NotificationTestJobResult = {
  success: boolean;
  userId: string | null;
  notification: SendNotificationResult;
};

/**
 * テスト用の Hello World 通知を送信するジョブ
 *
 * ユーザー識別方法:
 * - OneSignal の external_id = Supabase auth.users.id
 * - アプリ側で login(userId) を呼んで紐付け済み
 *
 * 使用方法:
 * TEST_USER_ID=your-user-uuid pnpm worker job notification-test
 */
export const notificationTest = async (
  ctx: WorkerContext,
): Promise<NotificationTestJobResult> => {
  ctx.logger.info("=== Starting notification-test job ===");

  // 環境変数からテスト対象のユーザーIDを取得
  const testUserId = process.env.TEST_USER_ID;

  if (!testUserId) {
    ctx.logger.error("TEST_USER_ID environment variable is not set");
    ctx.logger.info(
      "Usage: TEST_USER_ID=<user-uuid> pnpm worker job notification-test",
    );
    return {
      success: false,
      userId: null,
      notification: {
        success: false,
        error: "TEST_USER_ID is required",
      },
    };
  }

  ctx.logger.info("Sending test notification", { userId: testUserId });

  const result = await sendNotification(ctx, {
    title: "Hello World",
    message: "This is a test notification from the worker.",
    userIds: [testUserId],
    data: {
      type: "test",
      timestamp: new Date().toISOString(),
    },
  });

  if (result.success) {
    ctx.logger.info("=== notification-test job completed: SUCCESS ===", {
      notificationId: result.notificationId,
      recipients: result.recipients,
    });
  } else {
    ctx.logger.warn("=== notification-test job completed: FAILED ===", {
      error: result.error,
    });
  }

  return {
    success: result.success,
    userId: testUserId,
    notification: result,
  };
};
