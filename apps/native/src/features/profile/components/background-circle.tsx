import { Dimensions, View } from "react-native";
import { withUniwind } from "uniwind";

import { PROFILE_COLORS } from "../lib/colors";

const StyledView = withUniwind(View);
const { width } = Dimensions.get("window");

// 円の直径は画面幅の約1.5倍
const CIRCLE_SIZE = width * 1.5;

/**
 * 背景の大きな円
 *
 * 画面下部に配置される装飾的な円。
 * position: absolute で配置されるため、親要素に relative が必要。
 */
export const BackgroundCircle = () => (
  <StyledView
    style={{
      position: "absolute",
      bottom: -CIRCLE_SIZE * 0.4,
      left: (width - CIRCLE_SIZE) / 2,
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      borderRadius: CIRCLE_SIZE / 2,
      backgroundColor: PROFILE_COLORS.background,
      zIndex: 0,
    }}
  />
);
