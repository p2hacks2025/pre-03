import { Avatar, Card } from "heroui-native";
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
  const timeAgo = formatRelativeTime(createdAt);

  return (
    <Card className="w-full">
      <Card.Body className="flex-row gap-3 p-4">
        <StyledView>
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

        <StyledView className="flex-1">
          <StyledView className="flex-row items-start justify-between">
            <StyledText className="font-semibold text-base text-foreground">
              {username}
            </StyledText>
            <StyledText className="text-muted text-sm">{timeAgo}</StyledText>
          </StyledView>
          <StyledText className="mt-2 text-foreground text-sm leading-5">
            {content}
          </StyledText>
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
      </Card.Body>
    </Card>
  );
};
