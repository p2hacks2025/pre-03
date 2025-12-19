import type { TimelineEntry } from "@packages/schema/entry";
import { useCallback, useRef, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { createAuthenticatedClient } from "@/lib/api";
import { logger } from "@/lib/logger";

interface TimelineState {
  entries: TimelineEntry[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * タイムラインデータを取得するカスタムフック
 *
 * @example
 * ```tsx
 * const { entries, isLoading, isFetchingMore, hasMore, error, refresh, fetchMore } = useTimeline();
 *
 * return (
 *   <FlatList
 *     data={entries}
 *     renderItem={({ item }) => (
 *       <TimelineCard
 *         username={profile?.displayName ?? "名無し"}
 *         avatarUri={profile?.avatarUrl}
 *         {...item}
 *       />
 *     )}
 *     onEndReached={() => hasMore && !isFetchingMore && fetchMore()}
 *     onEndReachedThreshold={0.5}
 *   />
 * );
 * ```
 */
export const useTimeline = () => {
  const { accessToken } = useAuth();
  const [state, setState] = useState<TimelineState>({
    entries: [],
    isLoading: true,
    isFetchingMore: false,
    error: null,
    nextCursor: null,
    hasMore: false,
  });

  // 二重呼び出し防止用のref
  const isFetchingRef = useRef(false);
  const isFetchingMoreRef = useRef(false);

  const fetchTimeline = useCallback(async () => {
    if (!accessToken) {
      setState({
        entries: [],
        isLoading: false,
        isFetchingMore: false,
        error: "認証が必要です",
        nextCursor: null,
        hasMore: false,
      });
      return;
    }

    // 既にフェッチ中なら何もしない
    if (isFetchingRef.current) {
      logger.debug("fetchTimeline skipped: already fetching");
      return;
    }
    isFetchingRef.current = true;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    logger.debug("Fetching timeline");

    try {
      const authClient = createAuthenticatedClient(accessToken);
      const res = await authClient.entries.timeline.$get({
        query: { limit: 20 },
      });

      if (res.ok) {
        const data = await res.json();

        // 重複を排除
        const seen = new Set<string>();
        const uniqueEntries = data.entries.filter((e) => {
          const key = `${e.type}-${e.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        logger.info("Timeline fetched", {
          count: uniqueEntries.length,
          hasMore: data.hasMore,
        });
        setState({
          entries: uniqueEntries,
          isLoading: false,
          isFetchingMore: false,
          error: null,
          nextCursor: data.nextCursor,
          hasMore: data.hasMore,
        });
      } else {
        logger.warn("Timeline fetch failed", { status: res.status });
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: `取得に失敗しました (${res.status})`,
        }));
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Timeline fetch error", {}, err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "通信エラーが発生しました",
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [accessToken]);

  const fetchMore = useCallback(async () => {
    if (
      !accessToken ||
      !state.nextCursor ||
      state.isFetchingMore ||
      !state.hasMore
    ) {
      return;
    }

    // 既にフェッチ中なら何もしない（refresh との競合防止）
    if (isFetchingRef.current || isFetchingMoreRef.current) {
      logger.debug("fetchMore skipped: fetch in progress");
      return;
    }
    isFetchingMoreRef.current = true;

    setState((prev) => ({ ...prev, isFetchingMore: true }));
    logger.debug("Fetching more timeline", { cursor: state.nextCursor });

    try {
      const authClient = createAuthenticatedClient(accessToken);
      const res = await authClient.entries.timeline.$get({
        query: { limit: 20, cursor: state.nextCursor },
      });

      if (res.ok) {
        const data = await res.json();

        logger.info("More timeline fetched", {
          count: data.entries.length,
          hasMore: data.hasMore,
        });
        setState((prev) => {
          // 重複排除: 既存のIDセットを作成
          const existingIds = new Set(
            prev.entries.map((e) => `${e.type}-${e.id}`),
          );
          // 新しいエントリから重複を除外
          const newEntries = data.entries.filter(
            (e: TimelineEntry) => !existingIds.has(`${e.type}-${e.id}`),
          );

          return {
            ...prev,
            entries: [...prev.entries, ...newEntries],
            isFetchingMore: false,
            nextCursor: data.nextCursor,
            hasMore: data.hasMore,
          };
        });
      } else {
        logger.warn("Fetch more failed", { status: res.status });
        setState((prev) => ({
          ...prev,
          isFetchingMore: false,
        }));
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Fetch more error", {}, err);
      setState((prev) => ({
        ...prev,
        isFetchingMore: false,
      }));
    } finally {
      isFetchingMoreRef.current = false;
    }
  }, [accessToken, state.nextCursor, state.isFetchingMore, state.hasMore]);

  // useEffect は削除 - useFocusEffect に統一（home-screen.tsx で呼び出し）

  return {
    entries: state.entries,
    isLoading: state.isLoading,
    isFetchingMore: state.isFetchingMore,
    error: state.error,
    hasMore: state.hasMore,
    refresh: fetchTimeline,
    fetchMore,
  };
};
