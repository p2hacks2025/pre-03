import { ScrollView, View } from "react-native";
import { withUniwind } from "uniwind";

import { AiTimelineItem } from "@/features/timeline";

import { useDetailTimeline } from "../hooks";

const StyledView = withUniwind(View);
const StyledScrollView = withUniwind(ScrollView);

/**
 * 振り返り詳細画面の住人の様子タブコンポーネント
 *
 * タイムラインエントリのリストを表示します。
 * 将来的にはAPIから取得したデータを表示します。
 */
export const DetailTimeline = () => {
  const { data } = useDetailTimeline();

  return (
    <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <StyledView className="gap-3 px-4 pt-4 pb-6">
        {data.timelineEntries.map((entry) => (
          <AiTimelineItem
            key={entry.id}
            content={entry.content}
            createdAt={entry.createdAt}
            uploadImageUrl={entry.uploadImageUrl}
            author={entry.author}
          />
        ))}
      </StyledView>
    </StyledScrollView>
  );
};
