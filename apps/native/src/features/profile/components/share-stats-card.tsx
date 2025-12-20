import { Image, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import {
  AVATAR,
  SHARE_COLORS,
  STAT_ITEM,
  STATS_CARD,
} from "../lib/share-constants";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledImage = withUniwind(Image);

export interface ShareStatsCardProps {
  avatarUrl: string | null;
  displayName: string;
  streakDays: number;
  totalPosts: number;
  worldCount: number;
}

/**
 * シェア画像用の統計カード
 *
 * ViewShotでキャプチャするための静的サイズコンポーネント。
 * アバター、ユーザー名、統計情報を表示。
 */
export const ShareStatsCard = ({
  avatarUrl,
  displayName,
  streakDays,
  totalPosts,
  worldCount,
}: ShareStatsCardProps) => {
  return (
    <StyledView
      style={{
        width: STATS_CARD.WIDTH,
        backgroundColor: SHARE_COLORS.CARD_BACKGROUND,
        borderRadius: STATS_CARD.BORDER_RADIUS,
        paddingHorizontal: STATS_CARD.PADDING_HORIZONTAL,
        paddingVertical: STATS_CARD.PADDING_VERTICAL,
        // 影
        shadowColor: STATS_CARD.SHADOW.COLOR,
        shadowOffset: {
          width: STATS_CARD.SHADOW.OFFSET_X,
          height: STATS_CARD.SHADOW.OFFSET_Y,
        },
        shadowOpacity: STATS_CARD.SHADOW.OPACITY,
        shadowRadius: STATS_CARD.SHADOW.RADIUS,
        elevation: STATS_CARD.SHADOW.ELEVATION,
      }}
    >
      {/* ユーザー情報（アバター + 名前） */}
      <StyledView className="flex-row items-center">
        <StyledView
          style={{
            width: AVATAR.SIZE,
            height: AVATAR.SIZE,
            borderRadius: AVATAR.SIZE / 2,
            borderWidth: AVATAR.BORDER_WIDTH,
            borderColor: SHARE_COLORS.AVATAR_BORDER,
            overflow: "hidden",
            backgroundColor: SHARE_COLORS.DIVIDER,
          }}
        >
          {avatarUrl ? (
            <StyledImage
              source={{ uri: avatarUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <StyledView
              className="items-center justify-center"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: SHARE_COLORS.DIVIDER,
              }}
            >
              <StyledText
                style={{
                  fontSize: 48,
                  color: SHARE_COLORS.TEXT_SECONDARY,
                }}
              >
                {displayName.charAt(0)}
              </StyledText>
            </StyledView>
          )}
        </StyledView>
        <StyledText
          className="ml-6 font-bold"
          style={{
            fontSize: 44,
            color: SHARE_COLORS.TEXT_PRIMARY,
          }}
          numberOfLines={1}
        >
          {displayName}
        </StyledText>
      </StyledView>

      {/* セクションタイトル */}
      <StyledView className="mt-6 items-center">
        <StyledText
          style={{
            fontSize: 28,
            color: SHARE_COLORS.TEXT_SECONDARY,
          }}
        >
          日記の記録状況
        </StyledText>
      </StyledView>

      {/* 区切り線 */}
      <StyledView
        className="my-5"
        style={{
          height: 1,
          backgroundColor: SHARE_COLORS.DIVIDER,
        }}
      />

      {/* 統計情報（3列） */}
      <StyledView className="flex-row items-center justify-around">
        <ShareStatItem label="連続" value={streakDays} unit="日" />
        <ShareStatDivider />
        <ShareStatItem label="累計" value={totalPosts} unit="件" />
        <ShareStatDivider />
        <ShareStatItem label="世界創造" value={worldCount} unit="個" />
      </StyledView>
    </StyledView>
  );
};

/** 統計アイテム（シェア画像用） */
const ShareStatItem = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) => (
  <StyledView className="flex-1 items-center">
    <StyledText
      style={{
        fontSize: STAT_ITEM.LABEL_FONT_SIZE,
        color: SHARE_COLORS.TEXT_SECONDARY,
      }}
    >
      {label}
    </StyledText>
    <StyledView className="mt-3 flex-row items-baseline">
      <StyledText
        className="font-bold"
        style={{
          fontSize: STAT_ITEM.VALUE_FONT_SIZE,
          color: SHARE_COLORS.TEXT_PRIMARY,
        }}
      >
        {value}
      </StyledText>
      <StyledText
        className="ml-1"
        style={{
          fontSize: STAT_ITEM.UNIT_FONT_SIZE,
          color: SHARE_COLORS.TEXT_SECONDARY,
        }}
      >
        {unit}
      </StyledText>
    </StyledView>
  </StyledView>
);

/** 縦の区切り線（シェア画像用） */
const ShareStatDivider = () => (
  <StyledView
    style={{
      width: 1,
      height: 90,
      backgroundColor: SHARE_COLORS.DIVIDER,
    }}
  />
);
