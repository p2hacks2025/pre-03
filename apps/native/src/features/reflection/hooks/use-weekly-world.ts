import type { GetWeeklyWorldOutput } from "@packages/schema/reflection";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { createAuthenticatedClient } from "@/lib/api";
import { logger } from "@/lib/logger";

/**
 * 週間世界データ
 */
export interface WeeklyWorldData {
  weeklyWorld: GetWeeklyWorldOutput["weeklyWorld"] | null;
  userPosts: GetWeeklyWorldOutput["userPosts"];
  aiPosts: GetWeeklyWorldOutput["aiPosts"];
}

interface WeeklyWorldState {
  data: WeeklyWorldData;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
}

interface UseWeeklyWorldReturn extends WeeklyWorldData {
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  refresh: () => Promise<void>;
}

/**
 * 週間世界データを取得するフック
 *
 * @param weekStartDate 週の開始日（YYYY-MM-DD形式、月曜日）
 *
 * @example
 * ```tsx
 * const { weeklyWorld, userPosts, aiPosts, isLoading, error, notFound } = useWeeklyWorld("2025-12-15");
 * ```
 */
export const useWeeklyWorld = (weekStartDate: string): UseWeeklyWorldReturn => {
  const { accessToken } = useAuth();
  const [state, setState] = useState<WeeklyWorldState>({
    data: {
      weeklyWorld: null,
      userPosts: [],
      aiPosts: [],
    },
    isLoading: true,
    error: null,
    notFound: false,
  });

  const fetchWeeklyWorld = useCallback(async () => {
    if (!accessToken) {
      setState({
        data: { weeklyWorld: null, userPosts: [], aiPosts: [] },
        isLoading: false,
        error: "認証が必要です",
        notFound: false,
      });
      return;
    }

    if (!weekStartDate) {
      setState({
        data: { weeklyWorld: null, userPosts: [], aiPosts: [] },
        isLoading: false,
        error: "週の開始日が指定されていません",
        notFound: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    logger.debug("Fetching weekly world", { weekStartDate });

    try {
      const authClient = createAuthenticatedClient(accessToken);
      const res = await authClient.reflection["weekly-world"].$get({
        query: { weekStartDate },
      });

      if (res.ok) {
        const data = await res.json();
        logger.info("Weekly world fetched", {
          weekStartDate,
          userPostsCount: data.userPosts.length,
          aiPostsCount: data.aiPosts.length,
        });
        setState({
          data: {
            weeklyWorld: data.weeklyWorld,
            userPosts: data.userPosts,
            aiPosts: data.aiPosts,
          },
          isLoading: false,
          error: null,
          notFound: false,
        });
      } else {
        // 404の場合はnotFound、それ以外はエラー
        const status = res.status as number;
        if (status === 404) {
          logger.info("Weekly world not found", { weekStartDate });
          setState({
            data: { weeklyWorld: null, userPosts: [], aiPosts: [] },
            isLoading: false,
            error: null,
            notFound: true,
          });
        } else {
          logger.warn("Weekly world fetch failed", {
            status,
            weekStartDate,
          });
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: `取得に失敗しました (${status})`,
          }));
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Weekly world fetch error", { weekStartDate }, err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "通信エラーが発生しました",
      }));
    }
  }, [accessToken, weekStartDate]);

  useEffect(() => {
    fetchWeeklyWorld();
  }, [fetchWeeklyWorld]);

  return {
    weeklyWorld: state.data.weeklyWorld,
    userPosts: state.data.userPosts,
    aiPosts: state.data.aiPosts,
    isLoading: state.isLoading,
    error: state.error,
    notFound: state.notFound,
    refresh: fetchWeeklyWorld,
  };
};
