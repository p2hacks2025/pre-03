import { ScrollView, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { AiTimelineItem } from "@/features/timeline";

import type { AiTimelineItem as AiTimelineItemType } from "../hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledScrollView = withUniwind(ScrollView);

interface DetailTimelineProps {
  /**
   * タイムラインアイテムのリスト
   */
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
      <StyledView className="flex-1 items-center justify-center">
        <StyledText className="text-foreground/60">
          この週の住人の様子はありません
        </StyledText>
      </StyledView>
    );
  }

  return (
    <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <StyledView className="gap-3 px-4 pt-4 pb-6">
        {timelineItems.map((item) => (
          <AiTimelineItem
            key={item.id}
            content={item.content}
            createdAt={item.createdAt}
            uploadImageUrl={item.uploadImageUrl}
            author={item.author}
          />
        ))}
      </StyledView>
    </StyledScrollView>
  );
};
