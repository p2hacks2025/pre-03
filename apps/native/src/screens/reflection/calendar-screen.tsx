import { LinearGradient } from "expo-linear-gradient";
import { Button, Spinner } from "heroui-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  type ListRenderItem,
  Text,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { HEADER_HEIGHT, Header } from "@/components";
import {
  Calendar,
  type MonthGroup,
  StickyMonthHeader,
  StickyYearHeader,
  useCalendar,
} from "@/features/calendar";

/** 年月表示エリアの高さ */
const DATE_DISPLAY_HEIGHT = 40;

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export const CalendarScreen = () => {
  const insets = useSafeAreaInsets();

  const {
    monthGroups,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    hasMore,
    refresh,
  } = useCalendar();

  const [currentYear, setCurrentYear] = useState<number>(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    () => new Date().getMonth() + 1, // 1-12
  );

  const yearSeparatorMonthIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of monthGroups) {
      if (group.month === 1) {
        // 1月
        ids.add(group.monthId);
      }
    }
    return ids;
  }, [monthGroups]);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) return;

      // inverted リストでは、viewableItems の最後が画面上部のアイテム
      const topItem = viewableItems[viewableItems.length - 1]?.item as
        | MonthGroup
        | undefined;
      if (topItem) {
        setCurrentYear(topItem.year);
        setCurrentMonth(topItem.month);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 22,
  }).current;

  const renderItem: ListRenderItem<MonthGroup> = useCallback(
    ({ item }) => (
      <Calendar
        monthGroup={item}
        showYearSeparator={yearSeparatorMonthIds.has(item.monthId)}
      />
    ),
    [yearSeparatorMonthIds],
  );

  const keyExtractor = useCallback((item: MonthGroup) => item.monthId, []);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <StyledView className="items-center py-4">
        <Spinner size="sm" />
      </StyledView>
    );
  }, [isLoadingMore]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const totalHeaderHeight = HEADER_HEIGHT + DATE_DISPLAY_HEIGHT;

  // 初回ローディング
  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </StyledView>
    );
  }

  // エラー表示
  if (error) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-background px-4">
        <StyledText className="mb-4 text-center text-danger">
          {error}
        </StyledText>
        <Button onPress={refresh}>再読み込み</Button>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 bg-background">
      {/* ヘッダー（タイトルのみ） */}
      <Header title="今までの世界" backgroundColor="bg-background" />

      {/* 年月表示（ヘッダーの下） */}
      <StyledView
        className="absolute right-0 left-0 z-10 bg-background px-4 pb-3"
        style={{
          top: insets.top + HEADER_HEIGHT,
          height: DATE_DISPLAY_HEIGHT,
        }}
      >
        <StyledView className="flex-1 flex-row items-center">
          <StickyMonthHeader month={currentMonth} />
          <StickyYearHeader year={currentYear} />
          <StyledView className="w-16" />
        </StyledView>
        {/* 下向きの影 */}
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.08)", "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: "absolute",
            bottom: -8,
            left: 0,
            right: 0,
            height: 8,
          }}
          pointerEvents="none"
        />
      </StyledView>

      <FlatList
        data={monthGroups}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
        style={{ paddingTop: totalHeaderHeight }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </StyledView>
  );
};
