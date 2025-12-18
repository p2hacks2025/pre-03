import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PopupConfig } from "../types";

const LAST_LAUNCH_DATE_KEY = "popup_last_launch_date";
const POPUP_QUEUE_KEY = "popup_queue";

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

  /**
   * ポップアップキューを取得
   */
  async getQueue(): Promise<PopupConfig[]> {
    try {
      const data = await AsyncStorage.getItem(POPUP_QUEUE_KEY);
      if (!data) return [];
      return JSON.parse(data) as PopupConfig[];
    } catch {
      return [];
    }
  },

  /**
   * ポップアップキューを保存
   */
  async setQueue(queue: PopupConfig[]): Promise<void> {
    await AsyncStorage.setItem(POPUP_QUEUE_KEY, JSON.stringify(queue));
  },

  /**
   * ポップアップキューをクリア
   */
  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(POPUP_QUEUE_KEY);
  },
};
