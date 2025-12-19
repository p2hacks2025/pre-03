import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import {
  DetailDiary,
  DetailTabs,
  DetailTimeline,
} from "@/features/reflection/components";
import type { AiTimelineItem, DiaryEntry } from "@/features/reflection/hooks";
import { useWeeklyWorld, useWeekNavigation } from "@/features/reflection/hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);

type TabType = "diary" | "timeline";

export const ReflectionDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("diary");

  // ルートパラメータから週開始日を取得
  const { week } = useLocalSearchParams<{ week: string }>();

  // 週間世界データを取得
  const { weeklyWorld, userPosts, aiPosts, isLoading, error, refresh } =
    useWeeklyWorld(week ?? "");

  // 週ナビゲーション
  const {
    canGoPrev,
    canGoNext,
    goToPrevWeek,
    goToNextWeek,
    startDate,
    endDate,
  } = useWeekNavigation(week ?? "");

  // userPosts を DiaryEntry[] に変換
  const diaryEntries: DiaryEntry[] = userPosts.map((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    uploadImageUrl: post.uploadImageUrl,
  }));

  // aiPosts を AiTimelineItem[] に変換
  const timelineItems: AiTimelineItem[] = aiPosts.map((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    uploadImageUrl: post.imageUrl,
    author: {
      username: post.aiProfile.username,
      avatarUrl: post.aiProfile.avatarUrl,
    },
  }));

  // ローディング状態
  if (isLoading) {
    return (
      <StyledView
        className="flex-1 items-center justify-center bg-[#4ECCDD]"
        style={{ paddingTop: insets.top }}
      >
        <Spinner size="lg" color="white" />
      </StyledView>
    );
  }

  // エラー状態
  if (error) {
    return (
      <StyledView
        className="flex-1 items-center justify-center bg-[#4ECCDD] px-6"
        style={{ paddingTop: insets.top }}
      >
        <StyledText className="mb-4 text-center text-white">{error}</StyledText>
        <StyledPressable
          className="rounded-lg bg-white/20 px-6 py-3"
          onPress={refresh}
        >
          <StyledText className="font-medium text-white">再読み込み</StyledText>
        </StyledPressable>
      </StyledView>
    );
  }

  return (
    <StyledView
      className="flex-1 bg-[#4ECCDD]"
      style={{ paddingTop: insets.top, paddingBottom: 0 }}
    >
      {/* ヘッダー: 日付表示 */}
      <StyledView className="items-center justify-center px-6 py-6">
        <StyledText className="text-white text-xl">
          {startDate}~{endDate}
        </StyledText>
      </StyledView>

      {/* 世界画像パネル */}
      <StyledView className="relative h-60 items-center justify-center">
        {/* 前の週へ移動ボタン */}
        <StyledPressable
          className="absolute left-4 z-10"
          onPress={goToPrevWeek}
          disabled={!canGoPrev}
          style={{ opacity: canGoPrev ? 1 : 0.3 }}
        >
          <StyledView className="h-12 w-12 items-center justify-center">
            <View style={{ transform: [{ rotate: "270deg" }] }}>
              <Ionicons name="triangle" size={24} color="#DF6800" />
            </View>
          </StyledView>
        </StyledPressable>

        {/* 世界画像 */}
        {weeklyWorld?.weeklyWorldImageUrl ? (
          <Image
            source={{ uri: weeklyWorld.weeklyWorldImageUrl }}
            style={{ width: 300, height: 300 }}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require("../../../assets/world-example.png")}
            style={{ width: 300, height: 300 }}
            resizeMode="contain"
          />
        )}

        {/* 次の週へ移動ボタン */}
        <StyledPressable
          className="absolute right-4 z-10"
          onPress={goToNextWeek}
          disabled={!canGoNext}
          style={{ opacity: canGoNext ? 1 : 0.3 }}
        >
          <StyledView className="h-12 w-12 items-center justify-center">
            <View style={{ transform: [{ rotate: "90deg" }] }}>
              <Ionicons name="triangle" size={24} color="#DF6800" />
            </View>
          </StyledView>
        </StyledPressable>
      </StyledView>

      {/* タブ切り替え */}
      <DetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* タブコンテンツ */}
      <StyledView className="flex-1">
        {activeTab === "diary" ? (
          <DetailDiary diaryEntries={diaryEntries} />
        ) : (
          <DetailTimeline timelineItems={timelineItems} />
        )}
      </StyledView>
    </StyledView>
  );
};
