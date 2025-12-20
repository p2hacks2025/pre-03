"use client";

import { AiTimelineItem } from "@/features/timeline";

import type { AiTimelineItem as AiTimelineItemType } from "../types";

interface DetailTimelineProps {
  timelineItems: AiTimelineItemType[];
}

/**
 * 振り返り詳細画面の住人の様子タブコンポーネント
 *
 * タイムラインエントリのリストを表示します。
 * エントリがない場合は「この週の住人の様子はありません」メッセージを表示します。
 */
export const DetailTimeline = ({ timelineItems }: DetailTimelineProps) => {
  // タイムラインがない場合
  if (timelineItems.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <p className="text-gray-400">この週の住人の様子はありません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
      {timelineItems.map((item) => (
        <AiTimelineItem
          key={item.id}
          content={item.content}
          createdAt={item.createdAt}
          uploadImageUrl={item.uploadImageUrl}
          author={item.author}
        />
      ))}
    </div>
  );
};
