import Constants from "expo-constants";
import { Platform } from "react-native";
import type { LogLevel, OneSignal } from "react-native-onesignal";

/**
 * react-native-onesignal の型定義
 */
type OneSignalModule = {
  LogLevel: typeof LogLevel;
  OneSignal: typeof OneSignal;
};

/**
 * OneSignal モジュールを動的に読み込む
 * Expo Go では動作しないため、require で遅延読み込み
 */
const getOneSignal = () => {
  return require("react-native-onesignal") as OneSignalModule;
};

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
export const initializeOneSignal = (): void => {
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

  const { LogLevel, OneSignal } = getOneSignal();

  // デバッグ用ログレベル設定（本番では削除推奨）
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);

  // OneSignal 初期化
  OneSignal.initialize(ONESIGNAL_APP_ID);

  // iOS でプッシュ通知の許可をリクエスト
  if (Platform.OS === "ios") {
    OneSignal.Notifications.requestPermission(true);
  }
};

/**
 * 現在のユーザーに External User ID を設定
 * ログイン時に呼び出してユーザーを識別
 */
export const setOneSignalExternalUserId = async (
  userId: string,
): Promise<void> => {
  if (isExpoGo) return;
  const { OneSignal } = getOneSignal();
  OneSignal.login(userId);
};

/**
 * External User ID をクリア
 * ログアウト時に呼び出す
 */
export const clearOneSignalExternalUserId = async (): Promise<void> => {
  if (isExpoGo) return;
  const { OneSignal } = getOneSignal();
  OneSignal.logout();
};

/**
 * プッシュ通知の許可状態を確認
 */
export const hasNotificationPermission = (): boolean => {
  if (isExpoGo) return false;
  const { OneSignal } = getOneSignal();
  return OneSignal.Notifications.hasPermission();
};

/**
 * プッシュ通知の許可をリクエスト
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (isExpoGo) return false;
  const { OneSignal } = getOneSignal();
  return OneSignal.Notifications.requestPermission(true);
};
