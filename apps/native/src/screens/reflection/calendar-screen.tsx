import { useFonts } from "expo-font";
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

import {
  Calendar,
  type MonthGroup,
  StickyMonthHeader,
  StickyYearHeader,
  useCalendar,
} from "@/features/calendar";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export const CalendarScreen = () => {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Madoufmg: require("../../../assets/fonts/madoufmg.ttf"),
  });

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
    itemVisiblePercentThreshold: 10,
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

  const stickyHeaderHeight = 56;

  // フォントローディング
  if (!fontsLoaded) {
    return null;
  }

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
      <StyledView
        className="absolute top-0 right-0 left-0 z-10 bg-background px-4"
        style={{
          paddingTop: insets.top,
          height: insets.top + stickyHeaderHeight,
        }}
      >
        <StyledView className="flex-1 justify-center">
          <StyledText className="text-center font-bold text-2xl text-foreground">
            今までの世界
          </StyledText>
          <StyledView className="flex-row items-center">
            <StickyMonthHeader month={currentMonth} />
            <StickyYearHeader year={currentYear} />
            <StyledView className="w-16" />
          </StyledView>
        </StyledView>
      </StyledView>

      <FlatList
        data={monthGroups}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.bottom + 16,
        }}
        style={{ paddingTop: stickyHeaderHeight }}
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
