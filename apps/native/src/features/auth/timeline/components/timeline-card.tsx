import { Avatar, Card } from "heroui-native";
import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export interface TimelineCardProps {
  /**
   * ユーザー名
   */
  username: string;
  /**
   * ユーザーのサブテキスト（表示名など）
   */
  userSubtext: string;
  /**
   * 投稿本文
   */
  content: string;
  /**
   * 経過時間（例: "5分前", "2時間前"）
   */
  timeAgo: string;
  /**
   * アバター画像のURI（オプション）
   */
  avatarUri?: string;
}

/**
 * タイムライン用の投稿カードコンポーネント
 *
 * SNS風のタイムライン表示に使用するカードコンポーネント。
 * ユーザーアイコン、ユーザー名、投稿本文、経過時間を表示します。
 *
 * @example
 * ```tsx
 * <TimelineCard
 *   username="poyopoyo"
 *   userSubtext="ぽよぽよ"
 *   content="poyo~~~~~~~~~~~~~~~~~~~~いろはにほへとチリぬるをあああああああああああああああああああ"
 *   timeAgo="5分前"
 *   avatarUri={require("@/assets/user-icon.png")}
 * />
 * ```
 */
export const TimelineCard = ({
  username,
  userSubtext,
  content,
  timeAgo,
  avatarUri,
}: TimelineCardProps) => {
  return (
    <Card className="w-full">
      <Card.Body className="flex-row gap-3 p-4">
        {/* 左側: アバター */}
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

        {/* 中央: コンテンツエリア */}
        <StyledView className="flex-1 gap-1">
          {/* ヘッダー: ユーザー名と経過時間 */}
          <StyledView className="flex-row items-start justify-between">
            <StyledView className="flex-1 gap-0.5">
              <StyledText className="font-semibold text-base text-foreground">
                {username}
              </StyledText>
              <StyledText className="text-muted text-sm">
                {userSubtext}
              </StyledText>
            </StyledView>

            {/* 右上: 経過時間 */}
            <StyledText className="text-muted text-sm">{timeAgo}</StyledText>
          </StyledView>

          {/* 投稿本文 */}
          <StyledText className="mt-2 text-foreground text-sm leading-5">
            {content}
          </StyledText>
        </StyledView>
      </Card.Body>
    </Card>
  );
};
