import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useRef } from "react";
import {
  Dimensions,
  type LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ImageViewerModalProps } from "./types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ズームの制限値
const MIN_SCALE = 1;
const MAX_SCALE = 4;

// スワイプダウンで閉じる閾値
const DISMISS_THRESHOLD = 150;

/**
 * フルスクリーン画像ビューアーモーダル
 *
 * ピンチズーム、ダブルタップズーム、スワイプダウンで閉じる機能を提供
 *
 * @example
 * ```tsx
 * const [visible, setVisible] = useState(false);
 *
 * <ImageViewerModal
 *   visible={visible}
 *   imageUrl="https://example.com/image.png"
 *   onClose={() => setVisible(false)}
 * />
 * ```
 */
export const ImageViewerModal = ({
  visible,
  imageUrl,
  onClose,
}: ImageViewerModalProps) => {
  const insets = useSafeAreaInsets();

  // アニメーション用の共有値
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // 画像サイズを保持
  const imageWidth = useRef(SCREEN_WIDTH);
  const imageHeight = useRef(SCREEN_HEIGHT * 0.8);

  // ダブルタップの最後の位置
  const lastDoubleTapX = useSharedValue(0);
  const lastDoubleTapY = useSharedValue(0);

  // 状態をリセット
  const resetState = useCallback(() => {
    "worklet";
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [
    scale,
    savedScale,
    translateX,
    translateY,
    savedTranslateX,
    savedTranslateY,
  ]);

  // 閉じるときの処理
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  // 画像レイアウト取得
  const handleImageLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    imageWidth.current = width;
    imageHeight.current = height;
  }, []);

  // ピンチジェスチャー
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < MIN_SCALE) {
        scale.value = withTiming(MIN_SCALE);
        savedScale.value = MIN_SCALE;
      }
    });

  // パンジェスチャー
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // ズーム中のみパン有効
      if (savedScale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      } else {
        // ズームしていない場合は縦方向のみ（スワイプダウンで閉じる用）
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (savedScale.value > 1) {
        // ズーム中は位置を保存
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      } else {
        // スワイプダウンで閉じる
        if (event.translationY > DISMISS_THRESHOLD) {
          runOnJS(handleClose)();
        } else {
          translateY.value = withTiming(0);
        }
      }
    });

  // ダブルタップジェスチャー
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((event) => {
      lastDoubleTapX.value = event.x;
      lastDoubleTapY.value = event.y;
    })
    .onEnd(() => {
      if (scale.value > 1) {
        // ズームアウト
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // ズームイン（タップ位置を中心に）
        const targetScale = 2;
        scale.value = withTiming(targetScale);
        savedScale.value = targetScale;
      }
    });

  // ジェスチャーの組み合わせ
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTapGesture, panGesture),
  );

  // アニメーションスタイル
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.container}>
          {/* 閉じるボタン */}
          <Pressable
            style={[styles.closeButton, { top: insets.top + 16 }]}
            onPress={handleClose}
            hitSlop={16}
          >
            <Ionicons name="close" size={32} color="white" />
          </Pressable>

          {/* 画像表示エリア */}
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={styles.imageContainer}>
              <Animated.Image
                source={{ uri: imageUrl }}
                style={[styles.image, animatedImageStyle]}
                resizeMode="contain"
                onLayout={handleImageLayout}
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
});
