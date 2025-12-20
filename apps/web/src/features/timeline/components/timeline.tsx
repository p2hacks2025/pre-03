import { AiTimelineItem } from "./ai-timeline-item";
import { UserTimelineItem } from "./user-timeline-item";

import type { TimelineEntry } from "@packages/schema/entry";

export interface TimelineProps {
  items: TimelineEntry[];
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
export const Timeline = ({ items }: TimelineProps) => {
  return (
    <div className="flex flex-col gap-3 p-4">
      {items.map((item, index) =>
        item.type === "ai" ? (
          <AiTimelineItem key={`ai-${item.id}`} {...item} index={index} />
        ) : (
          <UserTimelineItem key={`user-${item.id}`} {...item} index={index} />
        ),
      )}
    </div>
  );
};
