import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import {
  DetailDiary,
  DetailTabs,
  DetailTimeline,
} from "@/features/reflection/components";
import type { AiTimelineItem, DiaryEntry } from "@/features/reflection/hooks";
import { useWeeklyWorld, useWeekNavigation } from "@/features/reflection/hooks";
import WorldShadowSvg from "../../../assets/world-shadow.svg";

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

  // 浮遊アニメーション
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -5],
  });

  const shadowScale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.4, 1.2],
  });

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

  // 画像ソースを決定（APIから取得した画像があればそれを使用、なければダミー画像）
  const worldImageSource = weeklyWorld?.weeklyWorldImageUrl
    ? { uri: weeklyWorld.weeklyWorldImageUrl }
    : require("../../../assets/world-example.png");

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

        {/* 世界画像（アニメーション付き） */}
        <StyledView className="items-center justify-center">
          <Animated.View
            style={{
              position: "absolute",
              bottom: 30,
              transform: [{ scaleX: shadowScale }, { scaleY: shadowScale }],
            }}
          >
            <WorldShadowSvg width={200} height={90} opacity={0.6} />
          </Animated.View>

          <Animated.Image
            source={worldImageSource}
            style={{
              width: 300,
              height: 300,
              transform: [{ translateY }],
            }}
            resizeMode="contain"
          />
        </StyledView>

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
