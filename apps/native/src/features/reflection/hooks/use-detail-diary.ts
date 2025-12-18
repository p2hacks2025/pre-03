import { useState } from "react";

export interface DiaryEntry {
  /**
   * 日記エントリの一意なID
   */
  id: string;
  /**
   * ユーザー名
   */
  username: string;
  /**
   * 日記の内容
   */
  content: string;
  /**
   * 投稿日時（例: "2025/12/14 22:39"）
   */
  timestamp: string;
  /**
   * アバター画像のURI（オプション）
   */
  avatarUri?: string;
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
        username: "ユーザーネーム",
        content: "なんかピザが食べたくなってきたな、頼んじゃおうかな",
        timestamp: "2025/12/14 22:39",
      },
      {
        id: "2",
        username: "ユーザーネーム",
        content:
          "なんかピザが食べたくなってきたな、頼んじゃおうかなあああああああああああああああああああああああああああああいいいいいいいいいいいいいいいいいいいいいい",
        timestamp: "2025/12/14 22:39",
      },
      {
        id: "3",
        username: "ユーザーネーム",
        content: "なんかピザが食べたくなってきたな、頼んじゃおうかな",
        timestamp: "2025/12/14 22:39",
      },
      {
        id: "4",
        username: "ユーザーネーム",
        content: "なんかピザが食べたくなってきたな、頼んじゃおうかな",
        timestamp: "2025/12/14 22:39",
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
