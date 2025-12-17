import { Avatar } from "heroui-native";
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
 *   content="poyo~~~~~~~~~~~~~~~~~~~~いろはにほへとチリぬるをあああああああああああああああああああ"
 *   timeAgo="5分前"
 *   avatarUri={require("@/assets/user-icon.png")}
 * />
 * ```
 */
export const TimelineCard = ({
  username,
  content,
  timeAgo,
  avatarUri,
}: TimelineCardProps) => {
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
        <StyledView className="mb-2 flex-row items-center justify-between">
          <StyledText className="font-semibold text-base text-white">
            {username}
          </StyledText>
          <StyledText className="text-gray-400 text-xs">{timeAgo}</StyledText>
        </StyledView>

        {/* 投稿本文 */}
        <StyledText className="text-sm text-white leading-5">
          {content}
        </StyledText>
      </StyledView>
    </StyledView>
  );
};
