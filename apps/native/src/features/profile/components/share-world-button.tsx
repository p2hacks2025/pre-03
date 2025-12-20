import { Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { FONT_FAMILY } from "@/lib/fonts";
import { logger } from "@/lib/logger";

import { PROFILE_COLORS } from "../lib/colors";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);

/**
 * 「今の世界をシェア」ボタン
 *
 * タップ時はログを出力するのみ（将来的にシェア機能を実装）
 */
export const ShareWorldButton = () => {
  const handlePress = () => {
    logger.info("Share button pressed");
  };

  return (
    <StyledView className="mt-4 items-center">
      <StyledPressable
        className="rounded-xl px-10 py-3 active:opacity-80"
        style={{ backgroundColor: PROFILE_COLORS.goldButton }}
        onPress={handlePress}
      >
        <StyledText
          className="text-center font-bold text-lg"
          style={{
            color: PROFILE_COLORS.textWhite,
            lineHeight: 24,
            fontFamily: FONT_FAMILY.MADOUFMG,
          }}
        >
          今の世界を{"\n"}シェア
        </StyledText>
      </StyledPressable>
    </StyledView>
  );
};
