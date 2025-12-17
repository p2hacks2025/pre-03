import { useCallback, useMemo, useState } from "react";
import {
  generatePastWeeks,
  getWeekStart,
  groupWeeksByMonth,
} from "../lib/date-utils";
import type { MonthGroup, WeekInfo } from "../types";

interface UseInfinitePastWeeksOptions {
  /** 初期表示する週の数 (デフォルト: 12) */
  initialWeekCount?: number;
  /** 追加読み込み時の週数 (デフォルト: 8) */
  loadMoreCount?: number;
}

interface UseInfinitePastWeeksReturn {
  /** 週リスト (現在週が先頭、過去に向かって追加) */
  weeks: WeekInfo[];
  /** 月ごとにグループ化された週 */
  monthGroups: MonthGroup[];
  /** ロード中フラグ */
  isLoadingMore: boolean;
  /** さらに過去のデータを読み込む */
  loadMore: () => void;
  /** まだ読み込めるデータがあるか */
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

        // 1週間前から開始
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const newWeeks = generatePastWeeks(lastWeekStart, loadMoreCount);

        // 2年前までの制限
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
