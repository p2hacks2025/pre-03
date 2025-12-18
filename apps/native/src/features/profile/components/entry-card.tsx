import { Image, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { formatDateTime } from "@/features/calendar/lib/date-utils";

import type { Entry } from "../types";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledImage = withUniwind(Image);

export interface EntryCardProps {
  entry: Entry;
}

/**
 * エントリーカードコンポーネント
 *
 * プロフィール画面で自分のエントリーを表示するためのカード。
 * 日時、本文、画像（オプション）を表示。
 */
export const EntryCard = ({ entry }: EntryCardProps) => {
  return (
    <StyledView
      className="border-divider/30 border-b px-4 py-4"
      style={{ backgroundColor: "transparent" }}
    >
      <StyledText className="mb-2 text-muted text-sm">
        {formatDateTime(entry.postedAt)}
      </StyledText>

      <StyledText className="text-base text-foreground leading-6">
        {entry.content}
      </StyledText>

      {entry.imageUrl && (
        <StyledView className="mt-3 overflow-hidden rounded-xl">
          <StyledImage
            source={{ uri: entry.imageUrl }}
            className="h-48 w-full"
            resizeMode="cover"
          />
        </StyledView>
      )}
    </StyledView>
  );
};
