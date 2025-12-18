/**
 * ポップアップの設定
 */
export interface PopupConfig {
  /** 一意の識別子（重複防止用） */
  id: string;
  /** ポップアップのタイトル */
  title: string;
  /** ポップアップのメッセージ */
  message: string;
  /** 画像URL（オプション） */
  imageUrl?: string | null;
  /** 閉じるボタンのラベル（デフォルト: "閉じる"） */
  closeButtonLabel?: string;
  /** 閉じた時のコールバック（オプション） */
  onClose?: () => void;
}

/**
 * ポップアップキュー内のアイテム
 */
export interface PopupQueueItem extends PopupConfig {
  /** キュー追加時のタイムスタンプ */
  addedAt: number;
}

/**
 * PopupContext の値
 */
export interface PopupContextValue {
  /** 現在表示中のポップアップ */
  currentPopup: PopupQueueItem | null;
  /** キュー内のポップアップ数 */
  queueLength: number;
  /** ポップアップをキューに追加 */
  enqueue: (config: PopupConfig) => void;
  /** 現在のポップアップを閉じて次へ */
  dismiss: () => void;
  /** 全てのポップアップをクリア */
  clearAll: () => void;
  /** ストレージからキューの読み込みが完了したか */
  isLoaded: boolean;
}

/**
 * 日付更新ステータス
 */
export type DailyUpdateStatus =
  | "更新なし"
  | "デイリー更新"
  | "ウィークリー更新";

/**
 * 日付更新情報
 */
export interface DailyUpdateInfo {
  title: string;
  message: string;
  imageUrl: string | null;
}

/**
 * 日付更新 API レスポンス
 */
export interface DailyUpdateResponse {
  /** 日付 (YYYY-MM-DD形式) */
  date: string;
  /** 更新ステータス */
  status: DailyUpdateStatus;
  /** デイリー更新情報 */
  daily: DailyUpdateInfo | null;
  /** ウィークリー更新情報 */
  weekly: DailyUpdateInfo | null;
}
