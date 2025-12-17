import { ScrollView, View } from "react-native";
import { withUniwind } from "uniwind";

import { TimelineCard } from "@/features/timeline/components";

import { useDetailDiary } from "../hooks";

const StyledView = withUniwind(View);
const StyledScrollView = withUniwind(ScrollView);

/**
 * 振り返り詳細画面の日記タブコンポーネント
 *
 * 日記エントリのリストを表示します。
 * 将来的にはAPIから取得したデータを表示します。
 */
export const DetailDiary = () => {
  const { data } = useDetailDiary();

  return (
    <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <StyledView className="gap-3 px-4 pt-4 pb-6">
        {data.diaryEntries.map((entry) => (
          <TimelineCard
            key={entry.id}
            username={entry.username}
            content={entry.content}
            timeAgo={entry.timestamp}
            avatarUri={entry.avatarUri}
          />
        ))}
      </StyledView>
    </StyledScrollView>
  );
};
