"use client";

import { useCallback, useEffect, useState } from "react";

import { client } from "@/lib/api";
import { logger } from "@/lib/logger";

import type { TimelineEntry } from "@packages/schema/entry";

export type SortOrder = "newest" | "oldest";

interface ProfileEntriesState {
  entries: TimelineEntry[];
  isLoading: boolean;
  error: string | null;
}

/**
 * 日付を YYYY-MM-DD 形式にフォーマット
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export interface UseProfileEntriesReturn {
  entries: TimelineEntry[];
  isLoading: boolean;
  error: string | null;
  sortOrder: SortOrder;
  selectedDate: Date | null;
  toggleSortOrder: () => void;
  setSelectedDate: (date: Date | null) => void;
  refresh: () => void;
}

/**
 * プロフィール画面用のエントリーデータを取得するフック
 *
 * 日付を指定してAPIからエントリーを取得。
 * ソート順と日付フィルタリングをサポート。
 */
export const useProfileEntries = (): UseProfileEntriesReturn => {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [state, setState] = useState<ProfileEntriesState>({
    entries: [],
    isLoading: true,
    error: null,
  });

  const fetchEntries = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 日付が指定されている場合は、その日のエントリーのみ取得
      const query: { limit: number; from?: string; to?: string } = {
        limit: 50,
      };

      if (selectedDate) {
        const dateStr = formatDate(selectedDate);
        query.from = dateStr;
        query.to = dateStr;
      }

      logger.debug("Fetching profile entries", { query });

      // Cookie認証: client を直接使用（credentials: 'include' 設定済み）
      const res = await client.entries.timeline.$get({ query });

      if (res.ok) {
        const data = await res.json();
        logger.info("Profile entries fetched", { count: data.entries.length });

        // ユーザー投稿のみフィルタリング
        const userEntries = data.entries.filter(
          (entry) => entry.type === "user",
        );

        setState({
          entries: userEntries,
          isLoading: false,
          error: null,
        });
      } else {
        logger.warn("Profile entries fetch failed", { status: res.status });
        setState({
          entries: [],
          isLoading: false,
          error: `取得に失敗しました (${res.status})`,
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Profile entries fetch error", {}, err);
      setState({
        entries: [],
        isLoading: false,
        error: "通信エラーが発生しました",
      });
    }
  }, [selectedDate]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ソート順に応じてエントリーを並び替え
  const sortedEntries = [...state.entries].sort((a, b) => {
    const diff =
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return sortOrder === "newest" ? diff : -diff;
  });

  return {
    entries: sortedEntries,
    isLoading: state.isLoading,
    error: state.error,
    sortOrder,
    selectedDate,
    toggleSortOrder,
    setSelectedDate,
    refresh: fetchEntries,
  };
};
