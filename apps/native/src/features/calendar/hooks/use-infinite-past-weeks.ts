import { useCallback, useMemo, useState } from "react";
import {
  generatePastWeeks,
  getWeekStart,
  groupWeeksByMonth,
} from "../lib/date-utils";
import type { MonthGroup, WeekInfo } from "../types";

interface UseInfinitePastWeeksOptions {
  initialWeekCount?: number;
  loadMoreCount?: number;
}

interface UseInfinitePastWeeksReturn {
  weeks: WeekInfo[];
  monthGroups: MonthGroup[];
  isLoadingMore: boolean;
  loadMore: () => void;
  hasMore: boolean;
}

export function useInfinitePastWeeks(
  options: UseInfinitePastWeeksOptions = {},
): UseInfinitePastWeeksReturn {
  const { initialWeekCount = 12, loadMoreCount = 8 } = options;

  const [weeks, setWeeks] = useState<WeekInfo[]>(() => {
    const today = new Date();
    const currentWeekStart = getWeekStart(today);
    return generatePastWeeks(currentWeekStart, initialWeekCount);
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const monthGroups = useMemo(() => groupWeeksByMonth(weeks), [weeks]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // 非同期風に処理（UIブロッキング回避）
    setTimeout(() => {
      setWeeks((prevWeeks) => {
        const lastWeek = prevWeeks[prevWeeks.length - 1];
        if (!lastWeek) {
          setIsLoadingMore(false);
          return prevWeeks;
        }

        const lastWeekStart = new Date(lastWeek.startDate);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const newWeeks = generatePastWeeks(lastWeekStart, loadMoreCount);

        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        if (lastWeekStart < twoYearsAgo) {
          setHasMore(false);
        }

        return [...prevWeeks, ...newWeeks];
      });

      setIsLoadingMore(false);
    }, 0);
  }, [isLoadingMore, hasMore, loadMoreCount]);

  return { weeks, monthGroups, isLoadingMore, loadMore, hasMore };
}
