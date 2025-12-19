import { useMemo } from "react";

import {
  formatDateToISO,
  parseISODate,
} from "@/features/calendar/lib/date-utils";

/**
 * 前週の月曜日を取得
 */
const getPrevWeekStartDate = (weekStartDate: string): string => {
  const date = parseISODate(weekStartDate);
  date.setDate(date.getDate() - 7);
  return formatDateToISO(date);
};

/**
 * 次週の月曜日を取得
 */
const getNextWeekStartDate = (weekStartDate: string): string => {
  const date = parseISODate(weekStartDate);
  date.setDate(date.getDate() + 7);
  return formatDateToISO(date);
};

/**
 * 今週の月曜日を取得
 */
const getCurrentWeekMonday = (): string => {
  const now = new Date();
  const day = now.getDay();
  // 日曜日(0)の場合は前の月曜日（-6日）、それ以外は当週の月曜日
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return formatDateToISO(monday);
};

/**
 * 2年前より古いかチェック
 */
const isOlderThanTwoYears = (weekStartDate: string): boolean => {
  const date = parseISODate(weekStartDate);
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  return date < twoYearsAgo;
};

/**
 * 週の終了日（日曜日）を取得
 */
const getWeekEndDate = (weekStartDate: string): string => {
  const date = parseISODate(weekStartDate);
  date.setDate(date.getDate() + 6);
  return formatDateToISO(date);
};

/**
 * 日付を表示用フォーマットに変換（例: "2025/12/15"）
 */
const formatDisplayDate = (dateStr: string): string => {
  const date = parseISODate(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}/${month}/${day}`;
};

/** 週移動の方向 */
export type WeekChangeDirection = "prev" | "next";

interface UseWeekNavigationReturn {
  /** 現在の週開始日 */
  currentWeekStartDate: string;
  /** 前の週に移動可能か（2年前まで） */
  canGoPrev: boolean;
  /** 次の週に移動可能か（今週まで） */
  canGoNext: boolean;
  /** 前週の週開始日 */
  prevWeekStartDate: string;
  /** 次週の週開始日 */
  nextWeekStartDate: string;
  /** 表示用の開始日（例: "2025/12/15"） */
  startDate: string;
  /** 表示用の終了日（例: "2025/12/21"） */
  endDate: string;
}

/**
 * 週間ナビゲーション情報を提供するフック
 *
 * @param weekStartDate 現在の週開始日（YYYY-MM-DD形式、月曜日）
 *
 * @example
 * ```tsx
 * const {
 *   canGoPrev,
 *   canGoNext,
 *   prevWeekStartDate,
 *   nextWeekStartDate,
 *   startDate,
 *   endDate,
 * } = useWeekNavigation("2025-12-15");
 *
 * // 週移動は呼び出し側で実装
 * const goToWeek = (newWeek: string, direction: WeekChangeDirection) => {
 *   setCurrentWeek(newWeek);
 * };
 * ```
 */
export const useWeekNavigation = (
  weekStartDate: string,
): UseWeekNavigationReturn => {
  return useMemo(() => {
    const prevWeek = getPrevWeekStartDate(weekStartDate);
    const nextWeek = getNextWeekStartDate(weekStartDate);
    const currentMonday = getCurrentWeekMonday();

    // 前週が2年前より古い場合は移動不可
    const canGoPrev = !isOlderThanTwoYears(prevWeek);

    // 次週が今週より先の場合は移動不可
    const canGoNext = nextWeek <= currentMonday;

    // 表示用の日付
    const startDate = formatDisplayDate(weekStartDate);
    const endDate = formatDisplayDate(getWeekEndDate(weekStartDate));

    return {
      currentWeekStartDate: weekStartDate,
      prevWeekStartDate: prevWeek,
      nextWeekStartDate: nextWeek,
      canGoPrev,
      canGoNext,
      startDate,
      endDate,
    };
  }, [weekStartDate]);
};
