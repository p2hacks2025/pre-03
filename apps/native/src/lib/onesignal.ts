import Constants from "expo-constants";
import { Platform } from "react-native";

const ONESIGNAL_APP_ID = Constants.expoConfig?.extra
  ?.ONESIGNAL_APP_ID as string;

/**
 * Expo Go で実行されているかどうかを判定
 */
const isExpoGo = Constants.appOwnership === "expo";

/**
 * OneSignal を初期化
 * アプリ起動時に一度だけ呼び出す
 * 注意: Expo Go では動作しません（Development Build が必要）
 */
export function initializeOneSignal(): void {
  if (isExpoGo) {
    console.warn(
      "OneSignal is not supported in Expo Go. Please use a development build.",
    );
    return;
  }

  if (!ONESIGNAL_APP_ID) {
    console.warn("OneSignal App ID is not configured");
    return;
  }

  // 動的インポートでネイティブモジュールを読み込み
  const { LogLevel, OneSignal } = require("react-native-onesignal");

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
  if (isExpoGo) return;
  const { OneSignal } = require("react-native-onesignal");
  OneSignal.login(userId);
}

/**
 * External User ID をクリア
 * ログアウト時に呼び出す
 */
export async function clearOneSignalExternalUserId(): Promise<void> {
  if (isExpoGo) return;
  const { OneSignal } = require("react-native-onesignal");
  OneSignal.logout();
}

/**
 * プッシュ通知の許可状態を確認
 */
export function hasNotificationPermission(): boolean {
  if (isExpoGo) return false;
  const { OneSignal } = require("react-native-onesignal");
  return OneSignal.Notifications.hasPermission();
}

/**
 * プッシュ通知の許可をリクエスト
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo) return false;
  const { OneSignal } = require("react-native-onesignal");
  return OneSignal.Notifications.requestPermission(true);
}
