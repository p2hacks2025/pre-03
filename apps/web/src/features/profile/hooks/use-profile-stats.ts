"use client";

import { useCallback, useEffect, useState } from "react";

import { client } from "@/lib/api";
import { clientLogger as logger } from "@/lib/logger-client";

export interface ProfileStats {
  /** 連続投稿日数 */
  streakDays: number;
  /** 投稿総数 */
  totalPosts: number;
  /** 作られた世界の数 */
  worldCount: number;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
}

interface UseProfileStatsReturn extends ProfileStats {
  /** 手動でデータを再取得 */
  refresh: () => void;
}

/**
 * プロフィール統計を取得するフック
 *
 * APIからユーザーの統計情報（連続投稿日数、投稿総数、作られた世界の数）を取得する。
 */
export const useProfileStats = (): UseProfileStatsReturn => {
  const [stats, setStats] = useState<ProfileStats>({
    streakDays: 0,
    totalPosts: 0,
    worldCount: 0,
    isLoading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setStats((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await client.user.stats.$get();

      if (res.ok) {
        const data = await res.json();
        setStats({
          streakDays: data.streakDays,
          totalPosts: data.totalPosts,
          worldCount: data.worldCount,
          isLoading: false,
          error: null,
        });
        logger.debug("Profile stats fetched", {
          streakDays: data.streakDays,
          totalPosts: data.totalPosts,
          worldCount: data.worldCount,
        });
      } else {
        const status = res.status as number;
        logger.warn("Profile stats fetch failed", { status });
        setStats((prev) => ({
          ...prev,
          isLoading: false,
          error: `取得に失敗しました (${status})`,
        }));
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Profile stats fetch error", {}, err);
      setStats((prev) => ({
        ...prev,
        isLoading: false,
        error: "通信エラーが発生しました",
      }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...stats,
    refresh: fetchStats,
  };
};
