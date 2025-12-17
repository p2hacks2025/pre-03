import { useState } from "react";

import type { Entry } from "../types";

const MOCK_ENTRIES: Entry[] = [
  {
    id: "1",
    postedAt: new Date(2025, 11, 17, 12, 30),
    content:
      "今日はとても良い天気でした。散歩に行って、近所の公園でコーヒーを飲みました。",
  },
  {
    id: "2",
    postedAt: new Date(2025, 11, 16, 9, 15),
    content: "新しいカフェを発見！抹茶ラテが美味しかった。",
    imageUrl: "https://picsum.photos/400/300",
  },
  {
    id: "3",
    postedAt: new Date(2025, 11, 15, 18, 45),
    content:
      "プロジェクトが無事に完了しました。チームのみんなに感謝です。打ち上げで焼肉を食べに行きました。",
  },
  {
    id: "4",
    postedAt: new Date(2025, 11, 14, 21, 0),
    content: "映画を見てきた。感動して泣いてしまった。",
    imageUrl: "https://picsum.photos/400/250",
  },
  {
    id: "5",
    postedAt: new Date(2025, 11, 13, 14, 20),
    content: "久しぶりに友達と会えて嬉しかった。",
  },
];

export type SortOrder = "newest" | "oldest";

export interface UseProfileEntriesReturn {
  entries: Entry[];
  sortOrder: SortOrder;
  toggleSortOrder: () => void;
}

/**
 * プロフィール画面用のエントリーデータを取得するフック
 *
 * 現在はモックデータを返す。
 * 将来的にはAPIから取得する。
 */
export const useProfileEntries = (): UseProfileEntriesReturn => {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  const sortedEntries = [...MOCK_ENTRIES].sort((a, b) => {
    const diff = b.postedAt.getTime() - a.postedAt.getTime();
    return sortOrder === "newest" ? diff : -diff;
  });

  return {
    entries: sortedEntries,
    sortOrder,
    toggleSortOrder,
  };
};
