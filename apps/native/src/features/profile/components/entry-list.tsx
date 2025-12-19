import { Ionicons } from "@expo/vector-icons";
import { Spinner } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { UserTimelineItem } from "@/features/timeline";

import { useProfileEntries } from "../hooks/use-profile-entries";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);

export const EntryList = () => {
  const { entries, isLoading, error, sortOrder, toggleSortOrder } =
    useProfileEntries();

  const sortLabel = sortOrder === "newest" ? "新しい順" : "古い順";

  return (
    <StyledView className="flex-1">
      {/* ソート切り替え */}
      <StyledView className="flex-row justify-end px-4 py-3">
        <StyledPressable
          className="flex-row items-center active:opacity-70"
          onPress={toggleSortOrder}
        >
          <StyledText className="text-foreground text-sm">
            {sortLabel}
          </StyledText>
          <StyledIonicons
            name={sortOrder === "newest" ? "chevron-down" : "chevron-up"}
            size={16}
            className="ml-1 text-foreground"
          />
        </StyledPressable>
      </StyledView>

      {/* ローディング */}
      {isLoading && (
        <StyledView className="items-center py-8">
          <Spinner size="lg" />
        </StyledView>
      )}

      {/* エラー */}
      {error && !isLoading && (
        <StyledView className="items-center py-8">
          <StyledText className="text-danger">{error}</StyledText>
        </StyledView>
      )}

      {/* 空状態 */}
      {!isLoading && !error && entries.length === 0 && (
        <StyledView className="items-center py-8">
          <StyledIonicons
            name="document-text-outline"
            size={48}
            className="mb-2 text-muted"
          />
          <StyledText className="text-muted">日記がありません</StyledText>
        </StyledView>
      )}

      {/* カードリスト */}
      {!isLoading && !error && entries.length > 0 && (
        <StyledView className="gap-3 px-4 pt-1">
          {entries.map((entry) => (
            <UserTimelineItem
              key={entry.id}
              content={entry.content}
              createdAt={entry.createdAt}
              uploadImageUrl={entry.uploadImageUrl}
              author={entry.author}
            />
          ))}
        </StyledView>
      )}
    </StyledView>
  );
};
