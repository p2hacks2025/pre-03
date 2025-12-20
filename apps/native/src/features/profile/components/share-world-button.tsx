import { Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { FONT_FAMILY } from "@/lib/fonts";
import { logger } from "@/lib/logger";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);

// カラー定義
const COLORS = {
  button: "#D6B575",
  buttonText: "#FFFFFF",
};

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
        style={{ backgroundColor: COLORS.button }}
        onPress={handlePress}
      >
        <StyledText
          className="text-center font-bold text-lg"
          style={{
            color: COLORS.buttonText,
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
