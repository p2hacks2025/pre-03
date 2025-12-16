import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { DetailTabs } from "@/features/reflection/components";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

type TabType = "diary" | "timeline";

export const ReflectionDetailScreen = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("diary");

  return (
    <StyledView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StyledView className="px-4 py-4">
        <StyledText className="mb-4 font-bold text-foreground text-xl">
          {date} の振り返り
        </StyledText>
      </StyledView>

      <DetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <StyledView className="flex-1 items-center justify-center px-4">
        {activeTab === "diary" ? (
          <StyledText className="text-foreground">
            日記コンテンツ: {date}
          </StyledText>
        ) : (
          <StyledText className="text-foreground">
            タイムラインコンテンツ: {date}
          </StyledText>
        )}
      </StyledView>

      <StyledView className="px-4 pb-4">
        <Button variant="secondary" onPress={() => router.back()}>
          <Button.Label>戻る</Button.Label>
        </Button>
      </StyledView>
    </StyledView>
  );
};
