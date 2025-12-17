import { useCallback, useMemo, useState } from "react";
import {
  createWeekInfo,
  formatDateToISO,
  getWeekStart,
  groupWeeksByMonth,
} from "../lib/date-utils";
import type { CalendarWeekData, MonthGroup, WeekInfo } from "../types";

/**
 * モックデータ（将来的にはAPIから取得）
 */
const MOCK_WEEK_DATA: CalendarWeekData[] = [
  {
    weekId: "2025-12-16",
    month: 11,
    startDate: "2025-12-16",
    endDate: "2025-12-22",
    imageUrl: null,
  },
  {
    weekId: "2025-12-09",
    month: 11,
    startDate: "2025-12-09",
    endDate: "2025-12-15",
    imageUrl: "https://picsum.photos/seed/week1/400/300",
  },
  {
    weekId: "2025-12-02",
    month: 11,
    startDate: "2025-12-02",
    endDate: "2025-12-08",
    imageUrl: "https://picsum.photos/seed/week2/400/300",
  },
  {
    weekId: "2025-11-25",
    month: 10,
    startDate: "2025-11-25",
    endDate: "2025-12-01",
    imageUrl: null,
  },
  {
    weekId: "2025-11-18",
    month: 10,
    startDate: "2025-11-18",
    endDate: "2025-11-24",
    imageUrl: "https://picsum.photos/seed/week3/400/300",
  },
];

/** weekId から画像URLを取得 */
function getImageUrlForWeek(weekId: string): string | null {
  const weekData = MOCK_WEEK_DATA.find((w) => w.weekId === weekId);
  return weekData?.imageUrl ?? null;
}

/** 過去N週間分の WeekInfo 配列を生成（imageUrl 付き） */
function generatePastWeeksWithImages(
  startWeekDate: Date,
  count: number,
): WeekInfo[] {
  const weeks: WeekInfo[] = [];

  for (let i = 0; i < count; i++) {
    const weekStart = new Date(startWeekDate);
    weekStart.setDate(startWeekDate.getDate() - i * 7);
    const weekId = formatDateToISO(weekStart);
    const imageUrl = getImageUrlForWeek(weekId);
    weeks.push(createWeekInfo(weekStart, imageUrl));
  }

  return weeks;
}

interface UseCalendarOptions {
  initialWeekCount?: number;
  loadMoreCount?: number;
}

interface UseCalendarReturn {
  weeks: WeekInfo[];
  monthGroups: MonthGroup[];
  isLoadingMore: boolean;
  loadMore: () => void;
  hasMore: boolean;
}

export function useCalendar(
  options: UseCalendarOptions = {},
): UseCalendarReturn {
  const { initialWeekCount = 12, loadMoreCount = 8 } = options;

  const [weeks, setWeeks] = useState<WeekInfo[]>(() => {
    const today = new Date();
    const currentWeekStart = getWeekStart(today);
    return generatePastWeeksWithImages(currentWeekStart, initialWeekCount);
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const monthGroups = useMemo(() => groupWeeksByMonth(weeks), [weeks]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // 非同期処理（UIブロッキング回避）
    setTimeout(() => {
      setWeeks((prevWeeks) => {
        const lastWeek = prevWeeks[prevWeeks.length - 1];
        if (!lastWeek) {
          setIsLoadingMore(false);
          return prevWeeks;
        }

        const lastWeekStart = new Date(lastWeek.startDate);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const newWeeks = generatePastWeeksWithImages(
          lastWeekStart,
          loadMoreCount,
        );

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
