import type { PopupConfig } from "../types";

const LAST_LAUNCH_DATE_KEY = "popup_last_launch_date";
const POPUP_QUEUE_KEY = "popup_queue";

export const popupStorage = {
  /**
   * 最後に起動した日付を取得
   */
  getLastLaunchDate(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(LAST_LAUNCH_DATE_KEY);
    } catch {
      return null;
    }
  },

  /**
   * 最後に起動した日付を保存
   */
  setLastLaunchDate(date: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(LAST_LAUNCH_DATE_KEY, date);
  },

  /**
   * 最後に起動した日付をクリア（デバッグ用）
   */
  clearLastLaunchDate(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LAST_LAUNCH_DATE_KEY);
  },

  /**
   * ポップアップキューを取得
   */
  getQueue(): PopupConfig[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(POPUP_QUEUE_KEY);
      if (!data) return [];
      return JSON.parse(data) as PopupConfig[];
    } catch {
      return [];
    }
  },

  /**
   * ポップアップキューを保存
   */
  setQueue(queue: PopupConfig[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(POPUP_QUEUE_KEY, JSON.stringify(queue));
  },

  /**
   * ポップアップキューをクリア
   */
  clearQueue(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(POPUP_QUEUE_KEY);
  },
};
