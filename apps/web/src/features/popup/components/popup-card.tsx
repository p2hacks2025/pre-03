"use client";

import { Button } from "@heroui/react";

interface PopupCardProps {
  title: string;
  message: string;
  imageUrl?: string | null;
  closeButtonLabel?: string;
  onClose: () => void;
  /** 残りのポップアップ数（キュー表示用） */
  remainingCount?: number;
}

export const PopupCard = ({
  title,
  message,
  imageUrl,
  closeButtonLabel = "OK",
  onClose,
  remainingCount = 0,
}: PopupCardProps) => {
  return (
    <div className="w-full max-w-sm animate-[slideInUp_300ms_ease-out]">
      <div className="overflow-hidden rounded-3xl bg-[#C4A574] p-4 shadow-xl">
        <h2 className="mb-2 text-center font-bold text-white text-xl">
          {title}
        </h2>

        <p className="mb-4 text-center text-base text-white">{message}</p>

        {imageUrl && (
          <div className="mb-4 flex justify-center">
            <div className="h-60 w-60 overflow-hidden rounded-xl">
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onPress={onClose}
            className="rounded-lg bg-[#E8DCC8] px-12 py-3 font-bold text-black text-lg"
          >
            {closeButtonLabel}
          </Button>
        </div>

        {remainingCount > 0 && (
          <p className="mt-3 text-center text-white/70 text-xs">
            あと {remainingCount} 件のお知らせがあります
          </p>
        )}
      </div>
    </div>
  );
};
