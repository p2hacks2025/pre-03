import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { useProfileEntries } from "../hooks/use-profile-entries";

import { EntryCard } from "./entry-card";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);

/**
 * エントリー一覧コンポーネント
 *
 * プロフィール画面で自分のエントリー一覧を表示。
 * ソート切り替え機能付き。
 */
export const EntryList = () => {
  const { entries, sortOrder, toggleSortOrder } = useProfileEntries();

  const sortLabel = sortOrder === "newest" ? "新しい順" : "古い順";

  return (
    <StyledView className="flex-1">
      {/* ソートバー */}
      <StyledView className="px-4 py-3">
        <StyledPressable
          className="flex-row items-center active:opacity-70"
          onPress={toggleSortOrder}
        >
          <StyledText className="text-foreground text-sm">
            {sortLabel}
          </StyledText>
          <StyledIonicons
            name="chevron-down"
            size={16}
            className="ml-1 text-foreground"
          />
        </StyledPressable>
      </StyledView>

      {/* カードリスト */}
      <StyledView className="pt-1">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </StyledView>
    </StyledView>
  );
};
