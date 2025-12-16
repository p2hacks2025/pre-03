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
    <StyledView className="flex-row border-divider border-b">
      <StyledPressable
        className={`flex-1 items-center py-3 ${
          activeTab === "diary" ? "border-primary border-b-2" : ""
        }`}
        onPress={() => onTabChange("diary")}
      >
        <StyledText
          className={`font-medium ${
            activeTab === "diary" ? "text-primary" : "text-muted"
          }`}
        >
          日記
        </StyledText>
      </StyledPressable>
      <StyledPressable
        className={`flex-1 items-center py-3 ${
          activeTab === "timeline" ? "border-primary border-b-2" : ""
        }`}
        onPress={() => onTabChange("timeline")}
      >
        <StyledText
          className={`font-medium ${
            activeTab === "timeline" ? "text-primary" : "text-muted"
          }`}
        >
          タイムライン
        </StyledText>
      </StyledPressable>
    </StyledView>
  );
};
