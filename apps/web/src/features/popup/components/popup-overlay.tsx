"use client";

import { useCallback } from "react";

import { usePopup } from "@/contexts/popup-context";

import { PopupCard } from "./popup-card";

/**
 * PopupOverlay
 * ポップアップを全画面オーバーレイで表示
 * 背景タップでは閉じない（ボタン操作のみ）
 */
export const PopupOverlay = () => {
  const { currentPopup, dismiss, queueLength } = usePopup();

  const handleClose = useCallback(() => {
    dismiss();
  }, [dismiss]);

  if (!currentPopup) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-[fadeIn_200ms_ease-out] items-center justify-center bg-black/50 p-6">
      <PopupCard
        key={currentPopup.id}
        title={currentPopup.title}
        message={currentPopup.message}
        imageUrl={currentPopup.imageUrl}
        closeButtonLabel={currentPopup.closeButtonLabel}
        onClose={handleClose}
        remainingCount={queueLength - 1}
      />
    </div>
  );
};
