"use client";

import { useMemo } from "react";

import { formatDateToISO } from "@/features/calendar/lib/date-utils";
import { useWeeklyWorld } from "@/features/reflection";

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

export interface CurrentWeekWorldReturn {
  /** 今週の世界画像URL */
  weeklyWorldImageUrl: string | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 世界データが存在するか */
  hasWorld: boolean;
  /** 世界が見つからなかったか（404） */
  notFound: boolean;
}

/**
 * 今週の世界データを取得するフック
 *
 * プロフィール画面用にシンプルなインターフェースを提供。
 * 内部では useWeeklyWorld を使用。
 *
 * @example
 * ```tsx
 * const { weeklyWorldImageUrl, isLoading, hasWorld } = useCurrentWeekWorld();
 *
 * if (isLoading) return <Spinner />;
 * if (hasWorld) {
 *   return <img src={weeklyWorldImageUrl} />;
 * }
 * return <Placeholder />;
 * ```
 */
export const useCurrentWeekWorld = (): CurrentWeekWorldReturn => {
  const currentWeekStart = useMemo(() => getCurrentWeekMonday(), []);

  const { weeklyWorld, isLoading, error, notFound } =
    useWeeklyWorld(currentWeekStart);

  return {
    weeklyWorldImageUrl: weeklyWorld?.weeklyWorldImageUrl ?? null,
    isLoading,
    error,
    hasWorld: !!weeklyWorld,
    notFound,
  };
};
