import type { CalendarWeek } from "@packages/schema/reflection";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { logger } from "@/lib/logger";

import { createWeekInfo, parseISODate } from "../lib/date-utils";
import type { MonthGroup, WeekInfo } from "../types";

interface CalendarState {
  monthGroups: MonthGroup[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  hasMore: boolean;
}

interface UseCalendarReturn {
  monthGroups: MonthGroup[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
  refresh: () => void;
}

/**
 * 前月を計算
 */
const getPreviousMonth = (
  year: number,
  month: number,
): { year: number; month: number } => {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
};

/**
 * 2年前より古いかチェック
 */
const isOlderThanTwoYears = (year: number, month: number): boolean => {
  const targetDate = new Date(year, month - 1, 1);
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  return targetDate < twoYearsAgo;
};

/**
 * 月IDを生成
 */
const getMonthId = (year: number, month: number): string => {
  return `${year}-${String(month).padStart(2, "0")}`;
};

/**
 * APIレスポンスをWeekInfo[]に変換
 */
const convertApiWeeksToWeekInfo = (apiWeeks: CalendarWeek[]): WeekInfo[] => {
  return apiWeeks.map((apiWeek) => {
    const weekStartDate = parseISODate(apiWeek.weekStartDate);
    return createWeekInfo(weekStartDate, apiWeek.weeklyWorldImageUrl);
  });
};

/**
 * カレンダーデータを取得するカスタムフック
 *
 * @example
 * ```tsx
 * const { monthGroups, isLoading, isLoadingMore, error, loadMore, hasMore, refresh } = useCalendar();
 *
 * return (
 *   <FlatList
 *     data={monthGroups}
 *     renderItem={({ item }) => <Calendar month={item} />}
 *     onEndReached={() => hasMore && !isLoadingMore && loadMore()}
 *     onEndReachedThreshold={0.5}
 *   />
 * );
 * ```
 */
export const useCalendar = (): UseCalendarReturn => {
  const { isAuthenticated, getAuthenticatedClient } = useAuth();
  const [state, setState] = useState<CalendarState>({
    monthGroups: [],
    isLoading: true,
    isFetchingMore: false,
    error: null,
    hasMore: true,
  });

  // 次に取得する月
  const nextMonth = useRef<{ year: number; month: number } | null>(null);
  // 取得済み月（重複防止）
  const fetchedMonths = useRef(new Set<string>());

  /**
   * 指定月のカレンダーデータを取得
   */
  const fetchMonth = useCallback(
    async (year: number, month: number, isInitial: boolean) => {
      if (!isAuthenticated) {
        setState({
          monthGroups: [],
          isLoading: false,
          isFetchingMore: false,
          error: "認証が必要です",
          hasMore: false,
        });
        return;
      }

      const monthId = getMonthId(year, month);

      if (fetchedMonths.current.has(monthId)) {
        logger.debug("Month already fetched, skipping", { monthId });
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isFetchingMore: false,
        }));
        return;
      }

      if (isInitial) {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
      } else {
        setState((prev) => ({ ...prev, isFetchingMore: true }));
      }

      logger.debug("Fetching calendar", { year, month });

      try {
        const authClient = getAuthenticatedClient();
        const res = await authClient.reflection.calendar.$get({
          query: { year, month },
        });

        if (res.ok) {
          const data = await res.json();
          const newWeeks = convertApiWeeksToWeekInfo(data.weeks);

          fetchedMonths.current.add(monthId);

          const newMonthGroup: MonthGroup = {
            monthId,
            month,
            year,
            weeks: newWeeks,
            entryDates: data.entryDates,
          };

          const prevMonth = getPreviousMonth(year, month);
          nextMonth.current = prevMonth;

          const hasMoreData = !isOlderThanTwoYears(
            prevMonth.year,
            prevMonth.month,
          );

          logger.info("Calendar fetched", {
            year,
            month,
            weeksCount: newWeeks.length,
            hasMore: hasMoreData,
          });

          setState((prev) => ({
            monthGroups: isInitial
              ? [newMonthGroup]
              : [...prev.monthGroups, newMonthGroup],
            isLoading: false,
            isFetchingMore: false,
            error: null,
            hasMore: hasMoreData,
          }));
        } else {
          logger.warn("Calendar fetch failed", { status: res.status });
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isFetchingMore: false,
            error: `取得に失敗しました (${res.status})`,
          }));
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Calendar fetch error", {}, err);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isFetchingMore: false,
          error: "通信エラーが発生しました",
        }));
      }
    },
    [isAuthenticated, getAuthenticatedClient],
  );

  /**
   * 初回ロード
   */
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // リセット
    fetchedMonths.current.clear();
    nextMonth.current = null;

    fetchMonth(currentYear, currentMonth, true);
  }, [fetchMonth]);

  /**
   * 追加読み込み（前月を取得）
   */
  const loadMore = useCallback(() => {
    if (state.isFetchingMore || !state.hasMore || !nextMonth.current) {
      return;
    }

    let { year, month } = nextMonth.current;

    while (fetchedMonths.current.has(getMonthId(year, month))) {
      if (isOlderThanTwoYears(year, month)) {
        setState((prev) => ({ ...prev, hasMore: false }));
        return;
      }
      const prev = getPreviousMonth(year, month);
      year = prev.year;
      month = prev.month;
    }

    nextMonth.current = { year, month };
    fetchMonth(year, month, false);
  }, [state.isFetchingMore, state.hasMore, fetchMonth]);

  /**
   * リフレッシュ（データを再取得）
   */
  const refresh = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // リセット
    fetchedMonths.current.clear();
    nextMonth.current = null;
    setState((prev) => ({ ...prev, monthGroups: [] }));

    fetchMonth(currentYear, currentMonth, true);
  }, [fetchMonth]);

  return {
    monthGroups: state.monthGroups,
    isLoading: state.isLoading,
    isLoadingMore: state.isFetchingMore,
    error: state.error,
    loadMore,
    hasMore: state.hasMore,
    refresh,
  };
};
