/**
 * 日記エントリの型定義
 */
export interface DiaryEntry {
  /** 日記エントリの一意なID */
  id: string;
  /** 日記の内容 */
  content: string;
  /** 投稿日時（ISO 8601形式） */
  createdAt: string;
  /** 添付画像URL */
  uploadImageUrl: string | null;
}

/**
 * AIタイムラインアイテムの型定義
 */
export interface AiTimelineItem {
  /** アイテムの一意なID */
  id: string;
  /** 投稿内容 */
  content: string;
  /** 投稿日時（ISO 8601形式） */
  createdAt: string;
  /** 添付画像URL */
  uploadImageUrl: string | null;
  /** 著者情報 */
  author: {
    username: string;
    avatarUrl: string | null;
  };
}
