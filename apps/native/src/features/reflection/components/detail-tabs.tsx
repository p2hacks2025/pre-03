import { Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);

type TabType = "diary" | "timeline";

interface DetailTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const DetailTabs = ({ activeTab, onTabChange }: DetailTabsProps) => {
  return (
    <StyledView className="flex-row">
      <StyledPressable
        className={`flex-1 items-center py-3 ${
          activeTab === "diary"
            ? "border-[#1100FF] border-b-2"
            : "border-white border-b-2"
        }`}
        onPress={() => onTabChange("diary")}
      >
        <StyledText
          className={`font-bold text-xl ${
            activeTab === "diary" ? "text-[#1100FF]" : "text-white"
          }`}
        >
          日記
        </StyledText>
      </StyledPressable>
      <StyledPressable
        className={`flex-1 items-center py-3 ${
          activeTab === "timeline"
            ? "border-[#1100FF] border-b-2"
            : "border-white border-b-2"
        }`}
        onPress={() => onTabChange("timeline")}
      >
        <StyledText
          className={`font-bold text-xl ${
            activeTab === "timeline" ? "text-[#1100FF]" : "text-white"
          }`}
        >
          住人の様子
        </StyledText>
      </StyledPressable>
    </StyledView>
  );
};
