"use client";

import { useState } from "react";
import { CloseOutline, CloudUploadOutline } from "react-ionicons";
import Image from "next/image";

import { cn } from "@/lib/utils";

export interface SelectedImage {
  file: File;
  preview: string;
}

export interface ImageUploadProps {
  selectedImage: SelectedImage | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  isDisabled?: boolean;
}

/**
 * 画像アップロードコンポーネント
 *
 * ドラッグ&ドロップとクリック選択に対応
 */
export const ImageUpload = ({
  selectedImage,
  onImageSelect,
  onImageRemove,
  isDisabled,
}: ImageUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!isDisabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (isDisabled) return;

    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      onImageSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      e.target.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageRemove();
  };

  if (selectedImage) {
    return (
      <div className="relative overflow-hidden rounded-xl">
        <Image
          src={selectedImage.preview}
          alt="選択された画像"
          width={600}
          height={400}
          className="h-48 w-full object-cover"
          unoptimized
        />
        <button
          type="button"
          onClick={handleRemove}
          disabled={isDisabled}
          className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-black/60 p-1.5 transition-colors hover:bg-black/80 disabled:opacity-50"
        >
          <CloseOutline color="#ffffff" width="18px" height="18px" />
        </button>
      </div>
    );
  }

  const inputId = "image-upload-input";

  return (
    <label
      htmlFor={inputId}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
        isDragOver
          ? "border-[#D6B575] bg-[#D6B575]/10"
          : "border-gray-600 hover:border-gray-500",
        isDisabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isDisabled}
      />
      <CloudUploadOutline color="#6B7280" width="48px" height="48px" />
      <p className="mt-3 text-center text-gray-400 text-sm">
        画像をドラッグ&ドロップ
        <br />
        またはクリックして選択
      </p>
    </label>
  );
};
