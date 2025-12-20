"use client";

import { useCallback, useEffect, useState } from "react";

import {
  formatDateToISO,
  parseISODate,
} from "@/features/calendar/lib/date-utils";
import { client } from "@/lib/api";
import { clientLogger as logger } from "@/lib/logger-client";

import type { WeeklyWorldData } from "../types";

interface CacheEntry {
  data: WeeklyWorldData;
  timestamp: number;
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
  prefetchAdjacent: () => void;
}

// グローバルキャッシュ（モジュールスコープ）
const weeklyWorldCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<WeeklyWorldData | null>>();

/** キャッシュの有効期限（5分） */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * キャッシュが有効かチェック
 */
const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

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
 * 週間世界データを取得するフック（キャッシュ + プリフェッチ機能付き）
 *
 * @param weekStartDate 週の開始日（YYYY-MM-DD形式、月曜日）
 *
 * @example
 * ```tsx
 * const {
 *   weeklyWorld,
 *   userPosts,
 *   aiPosts,
 *   isLoading,
 *   error,
 *   prefetchAdjacent,
 * } = useWeeklyWorld("2025-12-15");
 *
 * // 初回レンダリング後にプリフェッチ
 * useEffect(() => {
 *   if (!isLoading && weeklyWorld) {
 *     prefetchAdjacent();
 *   }
 * }, [isLoading, weeklyWorld, prefetchAdjacent]);
 * ```
 */
export const useWeeklyWorld = (weekStartDate: string): UseWeeklyWorldReturn => {
  const [state, setState] = useState<WeeklyWorldState>(() => {
    // 初期化時にキャッシュをチェック
    const cached = weeklyWorldCache.get(weekStartDate);
    if (cached && isCacheValid(cached)) {
      return {
        data: cached.data,
        isLoading: false,
        error: null,
        notFound: false,
      };
    }
    return {
      data: { weeklyWorld: null, userPosts: [], aiPosts: [] },
      isLoading: true,
      error: null,
      notFound: false,
    };
  });

  /**
   * APIからデータを取得（重複リクエスト防止付き）
   */
  const fetchWeeklyWorldData = useCallback(
    async (
      targetWeek: string,
      options?: { ignoreCache?: boolean },
    ): Promise<WeeklyWorldData | null> => {
      // キャッシュチェック（ignoreCache指定時はスキップ）
      if (!options?.ignoreCache) {
        const cached = weeklyWorldCache.get(targetWeek);
        if (cached && isCacheValid(cached)) {
          logger.debug("Cache hit for weekly world", { targetWeek });
          return cached.data;
        }
      }

      // 既に同じリクエストが進行中ならそれを返す
      const existingRequest = pendingRequests.get(targetWeek);
      if (existingRequest) {
        logger.debug("Deduplicating request for weekly world", { targetWeek });
        return existingRequest;
      }

      // 新しいリクエストを開始
      const promise = (async () => {
        logger.debug("Fetching weekly world", { targetWeek });

        try {
          const res = await client.reflection["weekly-world"].$get({
            query: { weekStartDate: targetWeek },
          });

          if (res.ok) {
            const data = await res.json();
            const weeklyWorldData: WeeklyWorldData = {
              weeklyWorld: data.weeklyWorld,
              userPosts: data.userPosts,
              aiPosts: data.aiPosts,
            };

            // キャッシュに保存
            weeklyWorldCache.set(targetWeek, {
              data: weeklyWorldData,
              timestamp: Date.now(),
            });

            logger.info("Weekly world fetched and cached", {
              targetWeek,
              userPostsCount: data.userPosts.length,
              aiPostsCount: data.aiPosts.length,
            });

            return weeklyWorldData;
          }

          // 404の場合はnullを返す
          const status = res.status as number;
          if (status === 404) {
            logger.info("Weekly world not found", { targetWeek });
            return null;
          }

          logger.warn("Weekly world fetch failed", { status, targetWeek });
          throw new Error(`取得に失敗しました (${status})`);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error("Weekly world fetch error", { targetWeek }, err);
          throw err;
        }
      })();

      pendingRequests.set(targetWeek, promise);

      try {
        return await promise;
      } finally {
        pendingRequests.delete(targetWeek);
      }
    },
    [],
  );

  /**
   * 現在の週のデータを取得
   */
  const fetchCurrentWeek = useCallback(
    async (options?: { ignoreCache?: boolean }) => {
      if (!weekStartDate) {
        setState({
          data: { weeklyWorld: null, userPosts: [], aiPosts: [] },
          isLoading: false,
          error: "週の開始日が指定されていません",
          notFound: false,
        });
        return;
      }

      // キャッシュがあれば即座に表示（ignoreCache指定時はスキップ）
      if (!options?.ignoreCache) {
        const cached = weeklyWorldCache.get(weekStartDate);
        if (cached && isCacheValid(cached)) {
          setState({
            data: cached.data,
            isLoading: false,
            error: null,
            notFound: false,
          });
          return;
        }
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const data = await fetchWeeklyWorldData(weekStartDate, options);

        if (data) {
          setState({
            data,
            isLoading: false,
            error: null,
            notFound: false,
          });
        } else {
          setState({
            data: { weeklyWorld: null, userPosts: [], aiPosts: [] },
            isLoading: false,
            error: null,
            notFound: true,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "通信エラーが発生しました";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
      }
    },
    [weekStartDate, fetchWeeklyWorldData],
  );

  /**
   * 前後の週をプリフェッチ
   */
  const prefetchAdjacent = useCallback(() => {
    if (!weekStartDate) return;

    const prevWeek = getPrevWeekStartDate(weekStartDate);
    const nextWeek = getNextWeekStartDate(weekStartDate);

    logger.debug("Prefetching adjacent weeks", { prevWeek, nextWeek });

    // バックグラウンドでプリフェッチ（エラーは無視）
    fetchWeeklyWorldData(prevWeek).catch(() => {});
    fetchWeeklyWorldData(nextWeek).catch(() => {});
  }, [weekStartDate, fetchWeeklyWorldData]);

  /**
   * 手動リフレッシュ（キャッシュを無視）
   */
  const refresh = useCallback(async () => {
    await fetchCurrentWeek({ ignoreCache: true });
  }, [fetchCurrentWeek]);

  // weekStartDateが変更されたらデータを取得
  useEffect(() => {
    fetchCurrentWeek();
  }, [fetchCurrentWeek]);

  return {
    weeklyWorld: state.data.weeklyWorld,
    userPosts: state.data.userPosts,
    aiPosts: state.data.aiPosts,
    isLoading: state.isLoading,
    error: state.error,
    notFound: state.notFound,
    refresh,
    prefetchAdjacent,
  };
};
