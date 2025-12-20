"use client";

import { UserTimelineItem } from "@/features/timeline";

import type { DiaryEntry } from "../types";

interface DetailDiaryProps {
  diaryEntries: DiaryEntry[];
}

/**
 * 振り返り詳細画面の日記タブコンポーネント
 *
 * 日記エントリのリストを表示します。
 * エントリがない場合は「この週の日記はありません」メッセージを表示します。
 */
export const DetailDiary = ({ diaryEntries }: DetailDiaryProps) => {
  // 日記がない場合
  if (diaryEntries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <p className="text-gray-400">この週の日記はありません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
      {diaryEntries.map((entry) => (
        <UserTimelineItem
          key={entry.id}
          content={entry.content}
          createdAt={entry.createdAt}
          uploadImageUrl={entry.uploadImageUrl}
          author={{ username: "", avatarUrl: null }}
        />
      ))}
    </div>
  );
};
