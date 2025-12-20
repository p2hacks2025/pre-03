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
    <div className="mx-auto flex max-w-2xl flex-col gap-3 p-4">
      {items.map((item) =>
        item.type === "ai" ? (
          <AiTimelineItem key={`ai-${item.id}`} {...item} />
        ) : (
          <UserTimelineItem key={`user-${item.id}`} {...item} />
        ),
      )}
    </div>
  );
};
