import { ScrollView, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { UserTimelineItem } from "@/features/timeline";

import type { DiaryEntry } from "../hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledScrollView = withUniwind(ScrollView);

interface DetailDiaryProps {
  /**
   * 日記エントリのリスト
   */
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
      <StyledView className="flex-1 items-center justify-center">
        <StyledText className="text-foreground/60">
          この週の日記はありません
        </StyledText>
      </StyledView>
    );
  }

  return (
    <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <StyledView className="gap-3 px-4 pt-4 pb-6">
        {diaryEntries.map((entry) => (
          <UserTimelineItem
            key={entry.id}
            content={entry.content}
            createdAt={entry.createdAt}
            uploadImageUrl={entry.uploadImageUrl}
            author={{ username: "", avatarUrl: null }}
          />
        ))}
      </StyledView>
    </StyledScrollView>
  );
};
