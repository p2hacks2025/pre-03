import type { TimelineEntry } from "@packages/schema/entry";
import { ScrollView, View } from "react-native";
import { withUniwind } from "uniwind";

import { AiTimelineItem } from "./ai-timeline-item";
import { UserTimelineItem } from "./user-timeline-item";

const StyledView = withUniwind(View);
const StyledScrollView = withUniwind(ScrollView);

export interface TimelineProps {
  /**
   * タイムラインアイテムの配列
   */
  items: TimelineEntry[];
}

/**
 * タイムラインリストコンポーネント
 *
 * TimelineEntry の type に応じて適切なコンポーネントを表示します。
 * - type === "ai": AiTimelineItem（SNS風デザイン）
 * - type === "user": UserTimelineItem（日記風デザイン）
 *
 * @example
 * ```tsx
 * <Timeline
 *   items={[
 *     {
 *       type: "ai",
 *       id: "1",
 *       content: "AIが生成したコンテンツです。",
 *       createdAt: "2025-12-18T10:30:00.000Z",
 *       uploadImageUrl: null,
 *       author: { username: "AIアシスタント", avatarUrl: null }
 *     },
 *     {
 *       type: "user",
 *       id: "2",
 *       content: "今日は良い天気でした。",
 *       createdAt: "2025-12-18T09:00:00.000Z",
 *       uploadImageUrl: null,
 *       author: { username: "田中", avatarUrl: null }
 *     },
 *   ]}
 * />
 * ```
 */
export const Timeline = ({ items }: TimelineProps) => {
  return (
    <StyledScrollView className="flex-1">
      <StyledView className="gap-3 p-4">
        {items.map((item) =>
          item.type === "ai" ? (
            <AiTimelineItem key={item.id} {...item} />
          ) : (
            <UserTimelineItem key={item.id} {...item} />
          ),
        )}
      </StyledView>
    </StyledScrollView>
  );
};
