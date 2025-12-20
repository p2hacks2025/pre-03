import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export interface FloatingAnimationValues {
  floatAnim: Animated.Value;
  translateY: Animated.AnimatedInterpolation<number>;
  shadowScale: Animated.AnimatedInterpolation<number>;
}

/**
 * 浮遊アニメーション用のカスタムフック
 *
 * 上下に揺れる浮遊アニメーションと、
 * それに連動する影のスケールアニメーションを提供。
 */
export const useFloatingAnimation = (): FloatingAnimationValues => {
  const floatAnim = useRef(new Animated.Value(0)).current;

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

  return { floatAnim, translateY, shadowScale };
};
