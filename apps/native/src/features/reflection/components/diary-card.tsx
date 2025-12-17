import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export interface DiaryCardProps {
  /**
   * 日記の投稿日
   */
  date: string;
  /**
   * 日記の本文
   */
  content: string;
}

/**
 * 日記詳細画面用のカードコンポーネント
 *
 *
 * @example
 * ```tsx
 * <DiaryCard
 *   date="2024/01/15"
 *   content="今日は楽しい一日でした。"
 * />
 * ```
 */
// インナーシャドウ効果のグラデーション設定
const INNER_SHADOW_GRADIENTS = [
  {
    id: "top",
    // 上から中心に向かう
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
    // 下から中心に向かう
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
    // 左から中心に向かう
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
    // 右から中心に向かう
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

export const DiaryCard = ({ date, content }: DiaryCardProps) => {
  return (
    <StyledView className="overflow-hidden rounded-md border border-[#A28758]">
      <StyledView
        className="rounded-md p-5"
        style={{
          backgroundColor: "#FFF4DE",
        }}
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

        <StyledView>
          <StyledText className="mb-2 text-black">{date}</StyledText>
        </StyledView>

        <StyledText className="text-black text-em leading-5">
          {content}
        </StyledText>
      </StyledView>
    </StyledView>
  );
};
