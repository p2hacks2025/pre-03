import { LinearGradient } from "expo-linear-gradient";
import { Image, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { FONT_FAMILY } from "@/lib/fonts";
import { formatAbsoluteTime } from "../lib/format-absolute-time";
import type { UserTimelineItemProps } from "./types";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledImage = withUniwind(Image);

export type { UserTimelineItemProps };

// インナーシャドウ効果のグラデーション設定
const INNER_SHADOW_GRADIENTS = [
  {
    id: "top",
    colors: [
      "rgba(190, 166, 123, 0.8)",
      "rgba(190, 166, 123, 0.4)",
      "rgba(190, 166, 123, 0.05)",
      "transparent",
    ] as const,
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    style: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      height: 20,
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
    },
  },
  {
    id: "bottom",
    colors: [
      "transparent",
      "rgba(190, 166, 123, 0.05)",
      "rgba(190, 166, 123, 0.4)",
      "rgba(190, 166, 123, 0.8)",
    ] as const,
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    style: {
      position: "absolute" as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: 20,
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
    },
  },
  {
    id: "left",
    colors: [
      "rgba(190, 166, 123, 0.8)",
      "rgba(190, 166, 123, 0.4)",
      "rgba(190, 166, 123, 0.05)",
      "transparent",
    ] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    style: {
      position: "absolute" as const,
      top: 0,
      bottom: 0,
      left: 0,
      width: 20,
      borderTopLeftRadius: 6,
      borderBottomLeftRadius: 6,
    },
  },
  {
    id: "right",
    colors: [
      "transparent",
      "rgba(190, 166, 123, 0.05)",
      "rgba(190, 166, 123, 0.4)",
      "rgba(190, 166, 123, 0.8)",
    ] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    style: {
      position: "absolute" as const,
      top: 0,
      bottom: 0,
      right: 0,
      width: 20,
      borderTopRightRadius: 6,
      borderBottomRightRadius: 6,
    },
  },
];

/**
 * 人間投稿用タイムラインアイテムコンポーネント
 *
 * 日記風のデザインで、絶対時間表示と画像添付に対応。
 *
 * @example
 * ```tsx
 * <UserTimelineItem
 *   content="今日は良い天気でした。"
 *   createdAt="2025-12-18T10:30:00.000Z"
 *   uploadImageUrl="https://example.com/image.png"
 *   author={{ username: "田中", avatarUrl: null }}
 * />
 * ```
 */
export const UserTimelineItem = ({
  content,
  createdAt,
  uploadImageUrl,
}: UserTimelineItemProps) => {
  const formattedDate = formatAbsoluteTime(createdAt);

  return (
    <StyledView className="overflow-hidden rounded-md border border-[#A28758]">
      <StyledView
        className="rounded-md p-5"
        style={{ backgroundColor: "#FFF4DE" }}
      >
        {INNER_SHADOW_GRADIENTS.map((gradient) => (
          <LinearGradient
            key={gradient.id}
            colors={gradient.colors}
            start={gradient.start}
            end={gradient.end}
            style={gradient.style}
            pointerEvents="none"
          />
        ))}

        {/* 日時表示 */}
        <StyledView>
          <StyledText
            className="mb-1 text-black"
            style={{ fontFamily: FONT_FAMILY.ZEN_KURENAIDO }}
          >
            {formattedDate}
          </StyledText>
        </StyledView>

        {/* 本文 */}
        <StyledText
          className="text-black text-em leading-5"
          style={{ fontFamily: FONT_FAMILY.ZEN_KURENAIDO }}
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
