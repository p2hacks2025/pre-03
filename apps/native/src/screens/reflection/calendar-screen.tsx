import { Spinner } from "heroui-native";
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
  type MonthGroup,
  MonthSection,
  useInfinitePastWeeks,
} from "@/features/calendar";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export const CalendarScreen = () => {
  const insets = useSafeAreaInsets();

  const { monthGroups, isLoadingMore, loadMore, hasMore } =
    useInfinitePastWeeks({
      initialWeekCount: 12,
      loadMoreCount: 8,
    });

  // 現在表示中の年
  const [currentYear, setCurrentYear] = useState<number>(() =>
    new Date().getFullYear(),
  );

  // 年セパレーターを表示すべき monthId のセット
  const yearSeparatorMonthIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of monthGroups) {
      // 1月の場合は年セパレーターを表示
      if (group.month === 0) {
        ids.add(group.monthId);
      }
    }
    return ids;
  }, [monthGroups]);

  // 表示中のアイテムが変わったときのコールバック
  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) return;

      // inverted リストでは、viewableItems の最後が画面上部のアイテム
      const topItem = viewableItems[viewableItems.length - 1]?.item as
        | MonthGroup
        | undefined;
      if (topItem) {
        setCurrentYear(topItem.year);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 10,
  }).current;

  const renderItem: ListRenderItem<MonthGroup> = useCallback(
    ({ item }) => (
      <MonthSection
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

  // スティッキーヘッダーの高さ
  const stickyHeaderHeight = 40;

  return (
    <StyledView className="flex-1 bg-background">
      {/* スティッキー年ヘッダー */}
      <StyledView
        className="absolute top-0 right-0 left-0 z-10 bg-background px-4"
        style={{
          paddingTop: insets.top,
          height: insets.top + stickyHeaderHeight,
        }}
      >
        <StyledView className="flex-1 justify-center">
          <StyledText className="font-bold text-foreground text-xl">
            {currentYear}年
          </StyledText>
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
