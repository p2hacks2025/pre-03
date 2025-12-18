import { ONESIGNAL_API_URL, type WorkerContext } from "@/lib";

export type SendNotificationParams = {
  title: string;
  message: string;
  userIds: string[];
  data?: Record<string, unknown>;
};

export type SendNotificationResult = {
  success: boolean;
  notificationId?: string;
  recipients?: number;
  error?: string;
};

/**
 * 指定したユーザーIDに対してプッシュ通知を送信
 * OneSignal の external_id を使用してユーザーを特定
 */
export const sendNotification = async (
  ctx: WorkerContext,
  params: SendNotificationParams,
): Promise<SendNotificationResult> => {
  const { title, message, userIds, data } = params;

  if (userIds.length === 0) {
    ctx.logger.warn("No userIds provided for notification");
    return { success: false, error: "No userIds provided" };
  }

  ctx.logger.info("Sending notification", {
    title,
    userCount: userIds.length,
  });

  try {
    const response = await fetch(ONESIGNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${ctx.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ctx.env.ONESIGNAL_APP_ID,
        include_aliases: {
          external_id: userIds,
        },
        target_channel: "push",
        headings: { en: title },
        contents: { en: message },
        ...(data && { data }),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      ctx.logger.error("OneSignal API error", {
        status: response.status,
        result,
      });
      return {
        success: false,
        error: result.errors?.join(", ") || `HTTP ${response.status}`,
      };
    }

    ctx.logger.info("Notification sent successfully", {
      notificationId: result.id,
      recipients: result.recipients,
    });

    return {
      success: true,
      notificationId: result.id,
      recipients: result.recipients,
    };
  } catch (error) {
    ctx.logger.error("Failed to send notification", {}, error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
