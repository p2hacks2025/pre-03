import { Ionicons } from "@expo/vector-icons";
import type { Entry } from "@packages/schema/entry";
import { useRouter } from "expo-router";
import { Spinner } from "heroui-native";
import { useCallback, useRef } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";
import { TimelineCard, useTimeline } from "@/features/timeline";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledTouchableOpacity = withUniwind(TouchableOpacity);
const StyledIonicons = withUniwind(Ionicons);
const StyledAnimatedView = withUniwind(Animated.View);
const StyledAnimatedText = withUniwind(Animated.Text);

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Entry>);

const HEADER_HEIGHT = 60;

export const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const {
    entries,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    refresh,
    fetchMore,
  } = useTimeline();

  // スクロール位置を追跡
  const scrollY = useRef(new Animated.Value(0)).current;

  // 「新世界の声」の透明度を計算（スクロール50pxで完全に透明）
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // ヘッダーの上方向への移動を計算（スクロールに合わせて押し上げ）
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT + 30],
    extrapolate: "clamp",
  });

  // 今日の日付を取得してフォーマット
  const today = new Date();
  const formattedDate = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  const handleEndReached = useCallback(() => {
    if (hasMore && !isFetchingMore) {
      fetchMore();
    }
  }, [hasMore, isFetchingMore, fetchMore]);

  const renderItem = useCallback(
    ({ item }: { item: Entry }) => (
      <StyledView className="px-4 pb-3">
        <TimelineCard
          username={profile?.displayName ?? "名無し"}
          avatarUri={profile?.avatarUrl ?? undefined}
          content={item.content}
          createdAt={item.createdAt}
          uploadImageUrl={item.uploadImageUrl}
        />
      </StyledView>
    ),
    [profile],
  );

  const renderListHeader = useCallback(() => {
    if (!error) return <StyledView className="h-4" />;

    return (
      <StyledView className="mx-4 mt-4 items-center rounded-lg bg-danger/10 p-4">
        <StyledText className="text-danger">{error}</StyledText>
        <StyledTouchableOpacity onPress={refresh} className="mt-2">
          <StyledText className="text-primary">再試行</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    );
  }, [error, refresh]);

  const renderListEmpty = useCallback(() => {
    if (isLoading || error) return null;

    return (
      <StyledView className="items-center py-12">
        <StyledIonicons
          name="document-text-outline"
          size={48}
          className="text-muted"
        />
        <StyledText className="mt-4 text-center text-muted">
          {"まだ投稿がありません\n最初の日記を書いてみましょう"}
        </StyledText>
      </StyledView>
    );
  }, [isLoading, error]);

  const renderListFooter = useCallback(() => {
    if (!isFetchingMore) return <StyledView className="h-4" />;

    return (
      <StyledView className="items-center py-4">
        <Spinner size="sm" />
      </StyledView>
    );
  }, [isFetchingMore]);

  const keyExtractor = useCallback((item: Entry) => item.id, []);

  // 初回ローディング表示
  if (isLoading && entries.length === 0) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
        <StyledText className="mt-4 text-muted">読み込み中...</StyledText>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 bg-background">
      <AnimatedFlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && entries.length > 0}
            onRefresh={refresh}
            progressViewOffset={HEADER_HEIGHT + insets.top}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
      />

      <StyledAnimatedView
        className="absolute top-0 right-0 left-0 items-center border-border border-b bg-white px-4"
        style={{
          paddingTop: insets.top + 0,
          paddingBottom: 12,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <StyledAnimatedText
          className="font-bold text-2xl text-foreground"
          style={{ opacity: titleOpacity }}
        >
          新世界の声
        </StyledAnimatedText>
        <StyledText className="font-bold text-foreground text-sm">
          {formattedDate}
        </StyledText>
      </StyledAnimatedView>

      <StyledView
        className="absolute right-0 bottom-0 p-4"
        style={{ paddingBottom: insets.bottom - 20 }}
      >
        <StyledTouchableOpacity
          className="size-14 items-center justify-center rounded-full bg-[#D6B575] shadow-lg"
          onPress={() => router.push("/(app)/diary/new")}
        >
          <StyledIonicons
            name="add"
            size={32}
            className="text-primary-foreground"
          />
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
