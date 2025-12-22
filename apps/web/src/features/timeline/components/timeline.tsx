import { AiTimelineItem } from "./ai-timeline-item";
import { UserTimelineItem } from "./user-timeline-item";

import type { TimelineEntry } from "@packages/schema/entry";

export interface TimelineProps {
  items: TimelineEntry[];
  batchStartIndex?: number;
}

/**
 * タイムラインコンポーネント
 *
 * AI投稿とユーザー投稿を区別して表示する。
 *
 * @example
 * ```tsx
 * <Timeline items={entries} />
 * ```
 */
export const Timeline = ({ items, batchStartIndex = 0 }: TimelineProps) => {
  return (
    <div className="flex flex-col gap-3 p-4">
      {items.map((item, index) => {
        // バッチ相対 index を計算（新しいアイテムは 0 から開始）
        const animationIndex =
          index >= batchStartIndex ? index - batchStartIndex : index;

        return item.type === "ai" ? (
          <AiTimelineItem
            key={`ai-${item.id}`}
            {...item}
            index={animationIndex}
          />
        ) : (
          <UserTimelineItem
            key={`user-${item.id}`}
            {...item}
            index={animationIndex}
          />
        );
      })}
    </div>
  );
};
