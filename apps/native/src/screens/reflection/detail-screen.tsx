import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import {
  DetailDiary,
  DetailTabs,
  DetailTimeline,
} from "@/features/reflection/components";
import { useDetailDiary } from "@/features/reflection/hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);

type TabType = "diary" | "timeline";

export const ReflectionDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("diary");
  const { data, handlePrevWorld, handleNextWorld } = useDetailDiary();

  return (
    <StyledView
      className="flex-1 bg-[#4ECCDD]"
      style={{ paddingTop: insets.top, paddingBottom: 0 }}
    >
      {/* ヘッダー: タイトルと日付範囲 */}
      <StyledView className="flex-row items-center justify-between px-6 py-6">
        <StyledText className="font-bold text-3xl text-white">
          {data.title}
        </StyledText>
        <StyledText className="text-sm text-white">
          {data.startDate}~{data.endDate}
        </StyledText>
      </StyledView>

      {/* 世界画像と矢印ナビゲーション */}
      <StyledView className="relative h-60 items-center justify-center">
        {/* 左矢印 */}
        <StyledPressable
          className="absolute left-4 z-10"
          onPress={handlePrevWorld}
        >
          <StyledView className="h-12 w-12 items-center justify-center">
            <Ionicons
              name="triangle"
              size={24}
              color="#DF6800"
              style={{ transform: [{ rotate: "270deg" }] }}
            />
          </StyledView>
        </StyledPressable>

        {/* 世界画像 */}
        <Image
          source={require("../../../assets/world-example.png")}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />

        {/* 右矢印 */}
        <StyledPressable
          className="absolute right-4 z-10"
          onPress={handleNextWorld}
        >
          <StyledView className="h-12 w-12 items-center justify-center">
            <Ionicons
              name="triangle"
              size={24}
              color="#DF6800"
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </StyledView>
        </StyledPressable>
      </StyledView>

      {/* タブ */}
      <DetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* タブコンテンツ */}
      <StyledView className="flex-1">
        {activeTab === "diary" ? <DetailDiary /> : <DetailTimeline />}
      </StyledView>
    </StyledView>
  );
};
