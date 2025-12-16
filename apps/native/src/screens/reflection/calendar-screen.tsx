import { Spinner } from "heroui-native";
import { useCallback } from "react";
import { FlatList, type ListRenderItem, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import {
  type MonthGroup,
  MonthSection,
  useInfinitePastWeeks,
} from "@/features/reflection";

const StyledView = withUniwind(View);

export const CalendarScreen = () => {
  const insets = useSafeAreaInsets();

  const { monthGroups, isLoadingMore, loadMore, hasMore } =
    useInfinitePastWeeks({
      initialWeekCount: 12,
      loadMoreCount: 8,
    });

  const renderItem: ListRenderItem<MonthGroup> = useCallback(
    ({ item }) => <MonthSection monthGroup={item} />,
    [],
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

  return (
    <StyledView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <FlatList
        data={monthGroups}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 16,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </StyledView>
  );
};
