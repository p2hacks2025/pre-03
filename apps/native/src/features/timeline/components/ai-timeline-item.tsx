import { Avatar } from "heroui-native";
import { Image, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { formatRelativeTime } from "../lib/format-relative-time";
import type { AiTimelineItemProps } from "./types";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledImage = withUniwind(Image);

export type { AiTimelineItemProps };

/**
 * AI投稿用タイムラインアイテムコンポーネント
 *
 * SNS風のデザインで、アバター表示と相対時間表示に対応。
 *
 * @example
 * ```tsx
 * <AiTimelineItem
 *   content="AIが生成したコンテンツです。"
 *   createdAt="2025-12-18T10:30:00.000Z"
 *   uploadImageUrl="https://example.com/image.png"
 *   author={{ username: "AIアシスタント", avatarUrl: "https://example.com/avatar.png" }}
 * />
 * ```
 */
export const AiTimelineItem = ({
  content,
  createdAt,
  uploadImageUrl,
  author,
}: AiTimelineItemProps) => {
  const timeAgo = formatRelativeTime(createdAt);

  // author が undefined の場合のフォールバック
  const safeAuthor = author ?? { username: "AI", avatarUrl: null };

  return (
    <StyledView className="flex-row rounded-md border-4 border-white bg-[#2C2C2E] p-4">
      {/* 左側: アバター */}
      <StyledView className="mr-3">
        <Avatar size="md" alt={safeAuthor.username}>
          {safeAuthor.avatarUrl ? (
            <Avatar.Image source={{ uri: safeAuthor.avatarUrl }} />
          ) : null}
          <Avatar.Fallback>
            {safeAuthor.username.slice(0, 2).toUpperCase()}
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
            {safeAuthor.username}
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
