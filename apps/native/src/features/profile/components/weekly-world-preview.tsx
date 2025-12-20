import { Spinner } from "heroui-native";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import WorldShadowSvg from "../../../../assets/world-shadow.svg";
import { useCurrentWeekWorld } from "../hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

// 世界画像のサイズ
const WORLD_IMAGE_SIZE = 250;
// 影のサイズ
const SHADOW_SIZE = { width: 170, height: 75 };
// コンテナの高さ
const CONTAINER_HEIGHT = 270;

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

  // 浮遊アニメーション値（React Native Animated）
  const floatAnim = useRef(new Animated.Value(0)).current;

  // アニメーション開始
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [floatAnim]);

  // 上下動のinterpolate
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -5], // 上下15pxの範囲で動く
  });

  // 影のスケール（世界が上に行くと影が縮小）
  const shadowScale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.4, 1.2],
  });

  // ローディング状態
  if (isLoading) {
    return (
      <StyledView
        className="items-center justify-center"
        style={{ height: CONTAINER_HEIGHT }}
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
        style={{ height: CONTAINER_HEIGHT }}
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
        style={{ height: CONTAINER_HEIGHT }}
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
      style={{ height: CONTAINER_HEIGHT }}
    >
      {/* 影（世界画像の下に配置） */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 30,
          transform: [{ scaleX: shadowScale }, { scaleY: shadowScale }],
        }}
      >
        <WorldShadowSvg
          width={SHADOW_SIZE.width}
          height={SHADOW_SIZE.height}
          opacity={0.6}
        />
      </Animated.View>

      {/* 世界画像（浮遊） */}
      <Animated.Image
        source={worldImageSource}
        style={{
          width: WORLD_IMAGE_SIZE,
          height: WORLD_IMAGE_SIZE,
          transform: [{ translateY }],
        }}
        resizeMode="contain"
      />
    </StyledView>
  );
};
