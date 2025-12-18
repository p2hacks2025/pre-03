import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  PopupConfig,
  PopupContextValue,
  PopupQueueItem,
} from "@/features/popup/types";

const PopupContext = createContext<PopupContextValue | null>(null);

/**
 * usePopup フック
 * PopupContext を使用してポップアップを制御
 */
export const usePopup = (): PopupContextValue => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
};

/**
 * PopupProvider
 * ポップアップキューを管理するプロバイダー
 */
export const PopupProvider = ({ children }: { children: React.ReactNode }) => {
  const [queue, setQueue] = useState<PopupQueueItem[]>([]);

  // 現在表示中のポップアップ（キューの先頭）
  const currentPopup = queue.length > 0 ? queue[0] : null;

  // ポップアップをキューに追加（重複防止）
  const enqueue = useCallback((config: PopupConfig) => {
    setQueue((prev) => {
      // 同じIDのポップアップが既にキューにある場合はスキップ
      if (prev.some((item) => item.id === config.id)) {
        return prev;
      }
      return [...prev, { ...config, addedAt: Date.now() }];
    });
  }, []);

  // 現在のポップアップを閉じて次へ（FIFO）
  const dismiss = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const [dismissed, ...rest] = prev;
      // onClose コールバックがあれば実行
      dismissed.onClose?.();
      return rest;
    });
  }, []);

  // 全てのポップアップをクリア
  const clearAll = useCallback(() => {
    setQueue([]);
  }, []);

  const value = useMemo<PopupContextValue>(
    () => ({
      currentPopup,
      queueLength: queue.length,
      enqueue,
      dismiss,
      clearAll,
    }),
    [currentPopup, queue.length, enqueue, dismiss, clearAll],
  );

  return (
    <PopupContext.Provider value={value}>{children}</PopupContext.Provider>
  );
};
