import type { DailyUpdateResponse } from "../types";

/**
 * 日付更新 API のモックレスポンス
 * 開発時に使用。API 実装後は削除または切り替え
 */
export const MOCK_DAILY_UPDATE_RESPONSE: DailyUpdateResponse = {
  date: "2024-12-18",
  status: "ウィークリー更新",
  daily: {
    title: "今日の振り返り",
    message:
      "今日も一日お疲れ様でした。昨日の記録を振り返って、今日の目標を立ててみましょう。",
    imageUrl: null,
  },
  weekly: {
    title: "週間サマリー",
    message:
      "今週の記録がまとまりました。1週間でどんな成長があったか確認してみましょう。",
    imageUrl: "https://picsum.photos/400/200",
  },
};

/**
 * 更新なしの場合のモックレスポンス
 */
export const MOCK_NO_UPDATE_RESPONSE: DailyUpdateResponse = {
  date: "2024-12-18",
  status: "更新なし",
  daily: null,
  weekly: null,
};

/**
 * デイリー更新のみの場合のモックレスポンス
 */
export const MOCK_DAILY_ONLY_RESPONSE: DailyUpdateResponse = {
  date: "2024-12-18",
  status: "デイリー更新",
  daily: {
    title: "今日の振り返り",
    message: "昨日の記録が更新されました。",
    imageUrl: null,
  },
  weekly: null,
};
