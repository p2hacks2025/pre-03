import {
  DotGothic16_400Regular,
  useFonts,
} from "@expo-google-fonts/dotgothic16";
import { Avatar } from "heroui-native";
import { Image, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { formatRelativeTime } from "../lib/format-relative-time";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledImage = withUniwind(Image);

export interface TimelineCardProps {
  username: string;
  content: string;
  createdAt: string;
  avatarUri?: string;
  uploadImageUrl?: string | null;
}

/**
 * タイムライン用の投稿カードコンポーネント
 *
 * SNS風のタイムライン表示に使用するカードコンポーネント。
 * ユーザーアイコン、ユーザー名、投稿本文、経過時間、添付画像を表示します。
 *
 * @example
 * ```tsx
 * <TimelineCard
 *   username="poyopoyo"
 *   content="今日はとても良い天気でした"
 *   createdAt="2025-12-18T10:30:00.000Z"
 *   avatarUri="https://example.com/avatar.png"
 *   uploadImageUrl="https://example.com/image.png"
 * />
 * ```
 */
export const TimelineCard = ({
  username,
  content,
  createdAt,
  avatarUri,
  uploadImageUrl,
}: TimelineCardProps) => {
  const [fontsLoaded] = useFonts({
    DotGothic16_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }
  const timeAgo = formatRelativeTime(createdAt);

  return (
    <StyledView className="flex-row rounded-md border-4 border-white bg-[#2C2C2E] p-4">
      {/* 左側: アバター */}
      <StyledView className="mr-3">
        <Avatar size="md" alt={username}>
          {avatarUri ? (
            <Avatar.Image
              source={
                typeof avatarUri === "string" ? { uri: avatarUri } : avatarUri
              }
            />
          ) : null}
          <Avatar.Fallback>
            {username.slice(0, 2).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
      </StyledView>

      {/* 右側: コンテンツエリア */}
      <StyledView className="flex-1">
        {/* ヘッダー: ユーザー名と経過時間 */}
        <StyledView className="flex-row items-center justify-between">
          <StyledText
            className="font-semibold text-base text-white"
            style={{ fontFamily: "DotGothic16_400Regular" }}
          >
            {username}
          </StyledText>
          <StyledText
            className="text-gray-400 text-xs"
            style={{ fontFamily: "DotGothic16_400Regular" }}
          >
            {timeAgo}
          </StyledText>
        </StyledView>

        {/* 投稿本文 */}
        <StyledText
          className="text-sm text-white leading-5"
          style={{ fontFamily: "DotGothic16_400Regular" }}
        >
          {content}
        </StyledText>

        {/* 添付画像 */}
        {uploadImageUrl && (
          <StyledView className="mt-3 overflow-hidden rounded-lg">
            <StyledImage
              source={{ uri: uploadImageUrl }}
              className="aspect-video w-full"
              resizeMode="cover"
            />
          </StyledView>
        )}
      </StyledView>
    </StyledView>
  );
};
