import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BASE_CONTAINER_HEIGHT,
  BASE_SHADOW_BOTTOM,
  BASE_SHADOW_SIZE,
  BASE_WORLD_IMAGE_SIZE,
  FULL_SIZE_THRESHOLD,
  HEADER_HEIGHT,
  MIN_SCALE,
  PROFILE_CARD_HEIGHT,
  TAB_BAR_HEIGHT,
} from "../lib/constants";

export interface WorldScaleValues {
  scale: number;
  worldImageSize: number;
  shadowSize: { width: number; height: number };
  containerHeight: number;
  shadowBottom: number;
}

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
 * 世界画像のスケール計算用カスタムフック
 *
 * 端末の画面サイズに応じて、世界画像・影・コンテナの
 * サイズを自動調整する値を提供。
 */
export const useWorldScale = (): WorldScaleValues => {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const values = useMemo(() => {
    // 利用可能な高さ = 画面高さ - SafeArea - ヘッダー - タブバー - プロフィールカード
    const availableHeight =
      screenHeight -
      insets.top -
      insets.bottom -
      HEADER_HEIGHT -
      TAB_BAR_HEIGHT -
      PROFILE_CARD_HEIGHT;

    const scale = calculateScale(availableHeight);

    return {
      scale,
      worldImageSize: Math.round(BASE_WORLD_IMAGE_SIZE * scale),
      shadowSize: {
        width: Math.round(BASE_SHADOW_SIZE.width * scale),
        height: Math.round(BASE_SHADOW_SIZE.height * scale),
      },
      containerHeight: Math.round(BASE_CONTAINER_HEIGHT * scale),
      shadowBottom: Math.round(BASE_SHADOW_BOTTOM * scale),
    };
  }, [screenHeight, insets.top, insets.bottom]);

  return values;
};
