import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { popupStorage } from "@/features/popup/lib/popup-storage";
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
 * キューは AsyncStorage に永続化され、閉じるボタンを押すまで保持される
 */
export const PopupProvider = ({ children }: { children: React.ReactNode }) => {
  const [queue, setQueue] = useState<PopupQueueItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInitializedRef = useRef(false);

  // 起動時にストレージからキューを復元
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const loadQueue = async () => {
      const savedQueue = await popupStorage.getQueue();
      if (savedQueue.length > 0) {
        setQueue(
          savedQueue.map((config) => ({
            ...config,
            addedAt: Date.now(),
          })),
        );
      }
      setIsLoaded(true);
    };
    loadQueue();
  }, []);

  // 現在表示中のポップアップ（キューの先頭）
  const currentPopup = queue.length > 0 ? queue[0] : null;

  // ポップアップをキューに追加（重複防止）& ストレージに保存
  const enqueue = useCallback((config: PopupConfig) => {
    setQueue((prev) => {
      // 同じIDのポップアップが既にキューにある場合はスキップ
      if (prev.some((item) => item.id === config.id)) {
        return prev;
      }
      const newQueue = [...prev, { ...config, addedAt: Date.now() }];
      // ストレージに保存（onClose は保存しない）
      const configsToSave = newQueue.map(
        ({ addedAt, onClose, ...rest }) => rest,
      );
      popupStorage.setQueue(configsToSave);
      return newQueue;
    });
  }, []);

  // 現在のポップアップを閉じて次へ（FIFO）& ストレージを更新
  const dismiss = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const [dismissed, ...rest] = prev;
      // onClose コールバックがあれば実行
      dismissed.onClose?.();
      // ストレージを更新
      const configsToSave = rest.map(({ addedAt, onClose, ...r }) => r);
      popupStorage.setQueue(configsToSave);
      return rest;
    });
  }, []);

  // 全てのポップアップをクリア & ストレージをクリア
  const clearAll = useCallback(() => {
    setQueue([]);
    popupStorage.clearQueue();
  }, []);

  const value = useMemo<PopupContextValue>(
    () => ({
      currentPopup,
      queueLength: queue.length,
      enqueue,
      dismiss,
      clearAll,
      isLoaded,
    }),
    [currentPopup, queue.length, enqueue, dismiss, clearAll, isLoaded],
  );

  return (
    <PopupContext.Provider value={value}>{children}</PopupContext.Provider>
  );
};
