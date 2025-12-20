import { Spinner } from "heroui-native";
import { useEffect, useRef } from "react";
import { Animated, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import WorldShadowSvg from "../../../../assets/world-shadow.svg";
import { useCurrentWeekWorld } from "../hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

// UIの固定高さ（ヘッダー、タブバー等）
const HEADER_HEIGHT = 60;
const TAB_BAR_HEIGHT = 50;
const PROFILE_CARD_HEIGHT = 380; // カード + 上部余白の概算

// 基準値
const BASE_WORLD_IMAGE_SIZE = 280;
const BASE_SHADOW_SIZE = { width: 190, height: 85 };
const BASE_CONTAINER_HEIGHT = 300;
const BASE_SHADOW_BOTTOM = 30;

// スケールのしきい値（この高さ以上ならスケール1.0）
const FULL_SIZE_THRESHOLD = 280;
const MIN_SCALE = 0.6;

/**
 * 利用可能な高さに応じたスケールを計算
 * - 十分な高さがあれば 1.0（フルサイズ）
 * - 小さい端末のみ縮小
 */
const calculateScale = (availableHeight: number): number => {
  if (availableHeight >= FULL_SIZE_THRESHOLD) {
    return 1.0;
  }
  const scale = availableHeight / FULL_SIZE_THRESHOLD;
  return Math.max(MIN_SCALE, scale);
};

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
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // 利用可能な高さ = 画面高さ - SafeArea - ヘッダー - タブバー - プロフィールカード
  const availableHeight =
    screenHeight -
    insets.top -
    insets.bottom -
    HEADER_HEIGHT -
    TAB_BAR_HEIGHT -
    PROFILE_CARD_HEIGHT;

  // 利用可能な高さに応じたスケール計算
  const scale = calculateScale(availableHeight);
  const worldImageSize = Math.round(BASE_WORLD_IMAGE_SIZE * scale);
  const shadowSize = {
    width: Math.round(BASE_SHADOW_SIZE.width * scale),
    height: Math.round(BASE_SHADOW_SIZE.height * scale),
  };
  const containerHeight = Math.round(BASE_CONTAINER_HEIGHT * scale);
  const shadowBottom = Math.round(BASE_SHADOW_BOTTOM * scale);

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
