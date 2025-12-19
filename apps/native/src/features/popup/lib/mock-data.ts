import type { DailyUpdateResponse } from "../types";

/**
 * 日付更新 API のモックレスポンス（ウィークリー更新）
 * 開発時に使用。API 実装後は削除または切り替え
 */
export const MOCK_DAILY_UPDATE_RESPONSE: DailyUpdateResponse = {
  date: "2025-12-19",
  status: "weekly_update",
  daily: {
    imageUrl: null,
  },
  weekly: {
    imageUrl: "https://picsum.photos/400/200",
  },
};

/**
 * 更新なしの場合のモックレスポンス
 */
export const MOCK_NO_UPDATE_RESPONSE: DailyUpdateResponse = {
  date: "2025-12-19",
  status: "no_update",
  daily: null,
  weekly: null,
};

/**
 * デイリー更新のみの場合のモックレスポンス
 */
export const MOCK_DAILY_ONLY_RESPONSE: DailyUpdateResponse = {
  date: "2025-12-19",
  status: "daily_update",
  daily: {
    imageUrl: "https://picsum.photos/400/200",
  },
  weekly: null,
};
