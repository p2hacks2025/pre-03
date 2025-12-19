import { useState } from "react";

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
  /**
   * 著者情報
   */
  author: {
    username: string;
    avatarUrl: string | null;
  };
}

export interface DetailDiaryData {
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
   * 日記エントリのリスト
   */
  diaryEntries: DiaryEntry[];
}

/**
 * 振り返り詳細画面で利用するデータと操作を提供するフック
 *
 * 将来的にAPIから取得する値をここで管理します。
 * 現在はモックデータを返します。
 */
export const useDetailDiary = () => {
  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);

  const data: DetailDiaryData = {
    title: "今までの世界",
    startDate: "2025/12/15",
    endDate: "2025/12/21",
    currentWorldIndex,
    diaryEntries: [
      {
        id: "1",
        content: "なんかピザが食べたくなってきたな、頼んじゃおうかな",
        createdAt: "2025-12-14T22:39:00.000Z",
        uploadImageUrl: null,
        author: { username: "ユーザーネーム", avatarUrl: null },
      },
      {
        id: "2",
        content:
          "なんかピザが食べたくなってきたな、頼んじゃおうかなあああああああああああああああああああああああああああああいいいいいいいいいいいいいいいいいいいいいい",
        createdAt: "2025-12-14T22:39:00.000Z",
        uploadImageUrl: null,
        author: { username: "ユーザーネーム", avatarUrl: null },
      },
      {
        id: "3",
        content: "なんかピザが食べたくなってきたな、頼んじゃおうかな",
        createdAt: "2025-12-14T22:39:00.000Z",
        uploadImageUrl: null,
        author: { username: "ユーザーネーム", avatarUrl: null },
      },
      {
        id: "4",
        content: "なんかピザが食べたくなってきたな、頼んじゃおうかな",
        createdAt: "2025-12-14T22:39:00.000Z",
        uploadImageUrl: null,
        author: { username: "ユーザーネーム", avatarUrl: null },
      },
    ],
  };

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
    handlePrevWorld,
    handleNextWorld,
  };
};
