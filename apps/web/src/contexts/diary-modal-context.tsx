"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface DiaryModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const DiaryModalContext = createContext<DiaryModalContextValue | null>(null);

/**
 * useDiaryModal フック
 * 日記作成モーダルの開閉を制御
 */
export const useDiaryModal = (): DiaryModalContextValue => {
  const context = useContext(DiaryModalContext);
  if (!context) {
    throw new Error("useDiaryModal must be used within a DiaryModalProvider");
  }
  return context;
};

/**
 * DiaryModalProvider
 * 日記作成モーダルの状態を管理
 */
export const DiaryModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo<DiaryModalContextValue>(
    () => ({
      isOpen,
      open,
      close,
    }),
    [isOpen, open, close],
  );

  return (
    <DiaryModalContext.Provider value={value}>
      {children}
    </DiaryModalContext.Provider>
  );
};
