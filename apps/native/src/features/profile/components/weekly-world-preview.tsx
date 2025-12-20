import { Spinner } from "heroui-native";
import { Animated, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import WorldShadowSvg from "../../../../assets/world-shadow.svg";

import {
  useCurrentWeekWorld,
  useFloatingAnimation,
  useWorldScale,
} from "../hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

/**
 * 今週の世界表示（浮遊アニメーション付き）
 *
 * - detail-screen.tsx と同じ浮遊アニメーション
 * - 世界画像 + 影
 * - ローディング、エラー、未生成状態のハンドリング
 */
export const WeeklyWorldPreview = () => {
  const { weeklyWorldImageUrl, isLoading, error, hasWorld, notFound } =
    useCurrentWeekWorld();
  const { translateY, shadowScale } = useFloatingAnimation();
  const { worldImageSize, shadowSize, containerHeight, shadowBottom } =
    useWorldScale();

  // ローディング状態
  if (isLoading) {
    return (
      <StyledView
        className="items-center justify-center"
        style={{ height: containerHeight }}
      >
        <Spinner size="lg" color="primary" />
      </StyledView>
    );
  }

  // エラー状態
  if (error) {
    return (
      <StyledView
        className="items-center justify-center px-6"
        style={{ height: containerHeight }}
      >
        <StyledText className="text-center text-red-500">{error}</StyledText>
      </StyledView>
    );
  }

  // 世界が見つからない（404）または存在しない
  if (notFound || !hasWorld) {
    return (
      <StyledView
        className="items-center justify-center px-6"
        style={{ height: containerHeight }}
      >
        <StyledText className="text-center text-muted">
          今週の世界はまだ生成されていません
        </StyledText>
      </StyledView>
    );
  }

  // 画像ソースを決定
  const worldImageSource = weeklyWorldImageUrl
    ? { uri: weeklyWorldImageUrl }
    : require("../../../../assets/world-example.png");

  return (
    <StyledView
      className="items-center justify-center"
      style={{ height: containerHeight }}
    >
      {/* 影（世界画像の下に配置） */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: shadowBottom,
          transform: [{ scaleX: shadowScale }, { scaleY: shadowScale }],
        }}
      >
        <WorldShadowSvg
          width={shadowSize.width}
          height={shadowSize.height}
          opacity={0.6}
        />
      </Animated.View>

      {/* 世界画像（浮遊） */}
      <Animated.Image
        source={worldImageSource}
        style={{
          width: worldImageSize,
          height: worldImageSize,
          transform: [{ translateY }],
        }}
        resizeMode="contain"
      />
    </StyledView>
  );
};
