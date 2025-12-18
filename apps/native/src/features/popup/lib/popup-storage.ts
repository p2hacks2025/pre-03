import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_LAUNCH_DATE_KEY = "popup_last_launch_date";

export const popupStorage = {
  /**
   * 最後に起動した日付を取得
   */
  async getLastLaunchDate(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LAST_LAUNCH_DATE_KEY);
    } catch {
      return null;
    }
  },

  /**
   * 最後に起動した日付を保存
   */
  async setLastLaunchDate(date: string): Promise<void> {
    await AsyncStorage.setItem(LAST_LAUNCH_DATE_KEY, date);
  },

  /**
   * 最後に起動した日付をクリア（デバッグ用）
   */
  async clearLastLaunchDate(): Promise<void> {
    await AsyncStorage.removeItem(LAST_LAUNCH_DATE_KEY);
  },
};
