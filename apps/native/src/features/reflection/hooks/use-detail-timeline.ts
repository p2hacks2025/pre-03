import { useState } from "react";

import type { AiTimelineItemProps } from "@/features/timeline";

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

export interface DetailTimelineData {
  /**
   * 期間のタイトル（例: "今までの世界"）
   */
  title: string;
  /**
   * 開始日（例: "2025/12/15"）
   */
  startDate: string;
  /**
   * 終了日（例: "2025/12/21"）
   */
  endDate: string;
  /**
   * 現在表示している世界のインデックス
   */
  currentWorldIndex: number;
  /**
   * タイムラインエントリのリスト
   */
  timelineEntries: TimelineEntry[];
}

/**
 * 振り返り詳細画面のタイムラインタブで利用するデータと操作を提供するフック
 *
 * 将来的にAPIから取得する値をここで管理します。
 * 現在はモックデータを返します。
 *
 * @example
 * ```tsx
 * const { data } = useDetailTimeline();
 * <Timeline items={data.timelineEntries} />
 * ```
 */
export const useDetailTimeline = () => {
  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);

  const data: DetailTimelineData = {
    title: "今までの世界",
    startDate: "2025/12/15",
    endDate: "2025/12/21",
    currentWorldIndex,
    timelineEntries: [
      {
        id: "1",
        content: "なんかピザが食べたくなってきたな、頼んじゃおうかな",
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        uploadImageUrl: null,
        author: { username: "AIアシスタント", avatarUrl: null },
      },
      {
        id: "2",
        content: "今日も一日がんばった!明日も頑張ろう",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        uploadImageUrl: null,
        author: { username: "AIアシスタント", avatarUrl: null },
      },
      {
        id: "3",
        content:
          "なんかピザが食べたくなってきたな、頼んじゃおうかなあああああああああああああああああああああああああああああいいいいいいいいいいいいいいいいいいいいいい",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        uploadImageUrl: null,
        author: { username: "AIアシスタント", avatarUrl: null },
      },
      {
        id: "4",
        content: "天気がいいから散歩に行ってきた",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        uploadImageUrl: null,
        author: { username: "AIアシスタント", avatarUrl: null },
      },
      {
        id: "5",
        content: "朝ごはんはパンケーキにしました",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        uploadImageUrl: null,
        author: { username: "AIアシスタント", avatarUrl: null },
      },
    ],
  };

  /**
   * AiTimelineItemコンポーネントにそのまま渡せる形式に変換
   */
  type AiTimelineItem = AiTimelineItemProps & { id: string };
  const timelineItems: AiTimelineItem[] = data.timelineEntries.map((entry) => ({
    id: entry.id,
    content: entry.content,
    createdAt: entry.createdAt,
    uploadImageUrl: entry.uploadImageUrl,
    author: entry.author,
  }));

  /**
   * 前の世界に移動
   */
  const handlePrevWorld = () => {
    setCurrentWorldIndex((prev) => Math.max(0, prev - 1));
  };

  /**
   * 次の世界に移動
   */
  const handleNextWorld = () => {
    // 将来的には総世界数と比較してチェック
    setCurrentWorldIndex((prev) => prev + 1);
  };

  return {
    data,
    timelineItems,
    handlePrevWorld,
    handleNextWorld,
  };
};
