/**
 * 日記エントリの型定義
 */
export interface DiaryEntry {
  /**
   * 日記エントリの一意なID
   */
  id: string;
  /**
   * 日記の内容
   */
  content: string;
  /**
   * 投稿日時（ISO 8601形式）
   */
  createdAt: string;
  /**
   * 添付画像URL
   */
  uploadImageUrl: string | null;
}

/**
 * 振り返り詳細画面の日記データ
 */
export interface DetailDiaryData {
  /**
   * 日記エントリのリスト
   */
  diaryEntries: DiaryEntry[];
}
