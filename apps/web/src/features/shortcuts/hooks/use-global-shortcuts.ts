"use client";

import { useEffect } from "react";

import { useDiaryModal } from "@/contexts/diary-modal-context";

/**
 * グローバルキーボードショートカットを処理するフック
 *
 * サポートするショートカット:
 * - n: 日記作成モーダルを開く
 */
export const useGlobalShortcuts = () => {
  const { open: openDiaryModal } = useDiaryModal();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカス中は無視
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable
      ) {
        return;
      }

      // 修飾キーが押されている場合は無視
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // 'n' キーで日記作成モーダルを開く
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openDiaryModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openDiaryModal]);
};
