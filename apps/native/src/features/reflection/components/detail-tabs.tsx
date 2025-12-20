import { useEffect, useRef, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);
const StyledAnimatedView = withUniwind(Animated.View);

type TabType = "diary" | "timeline";

interface DetailTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const DetailTabs = ({ activeTab, onTabChange }: DetailTabsProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  // タブの幅を計算（2つのタブで均等分割）
  const tabWidth = containerWidth / 2;

  // タブが切り替わったときにアニメーション
  useEffect(() => {
    const toValue = activeTab === "diary" ? 0 : tabWidth;
    Animated.timing(translateX, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabWidth, translateX]);

  return (
    <StyledView
      className="relative"
      onLayout={(event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {/* タブボタン */}
      <StyledView className="flex-row">
        <StyledPressable
          className="flex-1 items-center border-white border-b-2 py-3"
          onPress={() => onTabChange("diary")}
        >
          <StyledText
            className={`font-bold text-xl ${
              activeTab === "diary" ? "text-[#DF6800]" : "text-white"
            }`}
          >
            日記
          </StyledText>
        </StyledPressable>
        <StyledPressable
          className="flex-1 items-center border-white border-b-2 py-3"
          onPress={() => onTabChange("timeline")}
        >
          <StyledText
            className={`font-bold text-xl ${
              activeTab === "timeline" ? "text-[#DF6800]" : "text-white"
            }`}
          >
            住人の様子
          </StyledText>
        </StyledPressable>
      </StyledView>

      {/* アニメーションする下線 */}
      {containerWidth > 0 && (
        <StyledAnimatedView
          className="absolute bottom-0 h-0.5 bg-[#DF6800]"
          style={{
            width: tabWidth,
            transform: [{ translateX }],
          }}
        />
      )}
    </StyledView>
  );
};
