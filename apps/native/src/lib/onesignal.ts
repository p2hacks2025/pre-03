import Constants from "expo-constants";
import { Platform } from "react-native";
import { LogLevel, OneSignal } from "react-native-onesignal";

const ONESIGNAL_APP_ID = Constants.expoConfig?.extra
  ?.ONESIGNAL_APP_ID as string;

/**
 * OneSignal を初期化
 * アプリ起動時に一度だけ呼び出す
 */
export function initializeOneSignal(): void {
  if (!ONESIGNAL_APP_ID) {
    console.warn("OneSignal App ID is not configured");
    return;
  }

  // デバッグ用ログレベル設定（本番では削除推奨）
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);

  // OneSignal 初期化
  OneSignal.initialize(ONESIGNAL_APP_ID);

  // iOS でプッシュ通知の許可をリクエスト
  if (Platform.OS === "ios") {
    OneSignal.Notifications.requestPermission(true);
  }
}

/**
 * 現在のユーザーに External User ID を設定
 * ログイン時に呼び出してユーザーを識別
 */
export async function setOneSignalExternalUserId(
  userId: string,
): Promise<void> {
  OneSignal.login(userId);
}

/**
 * External User ID をクリア
 * ログアウト時に呼び出す
 */
export async function clearOneSignalExternalUserId(): Promise<void> {
  OneSignal.logout();
}

/**
 * プッシュ通知の許可状態を確認
 */
export function hasNotificationPermission(): boolean {
  return OneSignal.Notifications.hasPermission();
}

/**
 * プッシュ通知の許可をリクエスト
 */
export async function requestNotificationPermission(): Promise<boolean> {
  return OneSignal.Notifications.requestPermission(true);
}
