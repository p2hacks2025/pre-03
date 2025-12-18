import type { Entry } from "@packages/schema/entry";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { createAuthenticatedClient } from "@/lib/api";
import { logger } from "@/lib/logger";

interface TimelineState {
  entries: Entry[];
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

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    logger.debug("Fetching timeline");

    try {
      const authClient = createAuthenticatedClient(accessToken);
      const res = await authClient.entries.timeline.$get({
        query: { limit: 20 },
      });

      if (res.ok) {
        const data = await res.json();

        logger.info("Timeline fetched", {
          count: data.entries.length,
          hasMore: data.hasMore,
        });
        setState({
          entries: data.entries,
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
        setState((prev) => ({
          ...prev,
          entries: [...prev.entries, ...data.entries],
          isFetchingMore: false,
          nextCursor: data.nextCursor,
          hasMore: data.hasMore,
        }));
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
    }
  }, [accessToken, state.nextCursor, state.isFetchingMore, state.hasMore]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

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
