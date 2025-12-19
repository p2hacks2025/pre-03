import type { AiTimelineItemProps } from "@/features/timeline";

/**
 * タイムラインエントリの型定義
 */
export interface TimelineEntry {
  /**
   * エントリの一意なID
   */
  id: string;
  /**
   * 投稿内容
   */
  content: string;
  /**
   * 作成日時（ISO 8601形式）
   */
  createdAt: string;
  /**
   * 添付画像URL
   */
  uploadImageUrl: string | null;
  /**
   * 著者情報
   */
  author: {
    username: string;
    avatarUrl: string | null;
  };
}

/**
 * 振り返り詳細画面のタイムラインデータ
 */
export interface DetailTimelineData {
  /**
   * タイムラインエントリのリスト
   */
  timelineEntries: TimelineEntry[];
}

/**
 * AiTimelineItemコンポーネント用のProps型（IDを含む）
 */
export type AiTimelineItem = AiTimelineItemProps & { id: string };
