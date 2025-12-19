import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import {
  DetailDiary,
  DetailTabs,
  DetailTimeline,
} from "@/features/reflection/components";
import type {
  AiTimelineItem,
  DiaryEntry,
  WeekChangeDirection,
} from "@/features/reflection/hooks";
import {
  useWeeklyWorldPrefetch,
  useWeekNavigation,
} from "@/features/reflection/hooks";
import WorldShadowSvg from "../../../assets/world-shadow.svg";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);

type TabType = "diary" | "timeline";

/** スライドアニメーションの距離 */
const SLIDE_DISTANCE = 300;

export const ReflectionDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("diary");

  // ルートパラメータから週開始日を取得（初期値として使用）
  const { week: initialWeek } = useLocalSearchParams<{ week: string }>();

  // 現在表示中の週（状態で管理）
  const [currentWeek, setCurrentWeek] = useState(initialWeek ?? "");

  // スワイプ + ボタン共通のアニメーション値（Reanimated）
  const translateX = useSharedValue(0);

  // アニメーションスタイル
  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // 週ナビゲーション情報を取得
  const {
    canGoPrev,
    canGoNext,
    prevWeekStartDate,
    nextWeekStartDate,
    startDate,
    endDate,
  } = useWeekNavigation(currentWeek);

  // 週間世界データを取得（プリフェッチ機能付き）
  const {
    weeklyWorld,
    userPosts,
    aiPosts,
    isLoading,
    error,
    refresh,
    prefetchAdjacent,
  } = useWeeklyWorldPrefetch(currentWeek);

  /**
   * 週を移動する（スワイプ・ボタン共通）
   *
   * @param newWeek 移動先の週開始日
   * @param direction 移動方向
   *   - "prev": 前週へ移動（新コンテンツは左端から登場 → 左から右へスライドイン）
   *   - "next": 次週へ移動（新コンテンツは右端から登場 → 右から左へスライドイン）
   */
  const goToWeek = useCallback(
    (newWeek: string, direction: WeekChangeDirection) => {
      // 新しいコンテンツの開始位置
      // prev: 左端から登場（-SLIDE_DISTANCE）→ 左から右へスライドイン
      // next: 右端から登場（+SLIDE_DISTANCE）→ 右から左へスライドイン
      const startPosition =
        direction === "prev" ? -SLIDE_DISTANCE : SLIDE_DISTANCE;

      // 週を変更（即座に新しいコンテンツに切り替え）
      setCurrentWeek(newWeek);

      // withSequence で順序を保証：画面外から中央へスライドイン
      translateX.value = withSequence(
        withTiming(startPosition, { duration: 0 }), // 即座に画面外へ配置
        withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }), // 中央へスライドイン
      );
    },
    [translateX],
  );

  // ボタン操作
  const handlePrevWeek = useCallback(() => {
    if (canGoPrev) goToWeek(prevWeekStartDate, "prev");
  }, [canGoPrev, prevWeekStartDate, goToWeek]);

  const handleNextWeek = useCallback(() => {
    if (canGoNext) goToWeek(nextWeekStartDate, "next");
  }, [canGoNext, nextWeekStartDate, goToWeek]);

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

  // 浮遊アニメーション（React Native Animated - 世界画像の上下動）
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

  // 初回レンダリング後にプリフェッチ開始
  useEffect(() => {
    if (!isLoading && weeklyWorld) {
      prefetchAdjacent();
    }
  }, [isLoading, weeklyWorld, prefetchAdjacent]);

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
      <StyledView
        className="relative h-60 items-center justify-center"
        style={{ overflow: "hidden" }}
      >
        {/* 前の週へ移動ボタン（左ボタン） */}
        <StyledPressable
          className="absolute left-4 z-10"
          onPress={handlePrevWeek}
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
        <Reanimated.View
          style={[
            {
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            },
            slideAnimatedStyle,
          ]}
        >
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
        </Reanimated.View>

        {/* 次の週へ移動ボタン（右ボタン） */}
        <StyledPressable
          className="absolute right-4 z-10"
          onPress={handleNextWeek}
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
      <Reanimated.View
        style={[
          {
            flex: 1,
          },
          slideAnimatedStyle,
        ]}
      >
        {activeTab === "diary" ? (
          <DetailDiary diaryEntries={diaryEntries} />
        ) : (
          <DetailTimeline timelineItems={timelineItems} />
        )}
      </Reanimated.View>
    </StyledView>
  );
};
