import { ScrollView, View } from "react-native";
import { withUniwind } from "uniwind";

import { TimelineCard, type TimelineCardProps } from "./timeline-card";

const StyledView = withUniwind(View);
const StyledScrollView = withUniwind(ScrollView);

/**
 * TimelineCardProps に id フィールドを追加した型
 */
export type TimelineItem = TimelineCardProps & {
  /**
   * アイテムの一意なID
   */
  id: string;
};

export interface TimelineProps {
  /**
   * タイムラインアイテムの配列
   */
  items: TimelineItem[];
}

/**
 * タイムラインリストコンポーネント
 *
 * TimelineCard のリストを表示するコンポーネント。
 * APIとの接続時に楽になるよう、リスト化しています。
 *
 * @example
 * ```tsx
 * <Timeline
 *   items={[
 *     {
 *       username: "poyopoyo",
 *       content: "ピザが食べたくなってきた",
 *       timeAgo: "5分前",
 *       avatarUri: require("@/assets/user-icon.png")
 *     },
 *     ...
 *   ]}
 * />
 * ```
 */
export const Timeline = ({ items }: TimelineProps) => {
  return (
    <StyledScrollView className="flex-1">
      <StyledView className="gap-3 p-4">
        {items.map((item) => (
          <TimelineCard key={item.id} {...item} />
        ))}
      </StyledView>
    </StyledScrollView>
  );
};
