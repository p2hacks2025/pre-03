"use client";

import { useEffect } from "react";
import { CloseOutline } from "react-ionicons";
import { Button } from "@heroui/react";

import { useDiaryModal } from "@/contexts/diary-modal-context";

import { DiaryForm } from "./diary-form";

/**
 * 日記作成モーダル
 * サイドバーを除く部分の中央に表示
 */
export const DiaryModal = () => {
  const { isOpen, close } = useDiaryModal();

  // Escキーでモーダルを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  if (!isOpen) {
    return null;
  }

  const handleSuccess = () => {
    close();
  };

  return (
    <div className="fixed inset-y-0 right-0 left-60 z-40 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-2xl animate-[fadeIn_200ms_ease-out] rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-gray-200 border-b px-6 py-4">
          <h2 className="font-bold text-gray-900 text-xl">日記を書く</h2>
          <Button isIconOnly variant="light" onPress={close}>
            <CloseOutline color="#9CA3AF" width="24px" height="24px" />
          </Button>
        </header>

        <div className="p-6">
          <DiaryForm onSuccess={handleSuccess} onCancel={close} />
        </div>
      </div>
    </div>
  );
};
