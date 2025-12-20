"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Textarea } from "@heroui/react";

import { useDiarySubmit } from "../hooks/use-diary-submit";
import { ImageUpload, type SelectedImage } from "./image-upload";

export interface DiaryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * 日記作成フォームコンポーネント
 *
 * PC向け最適化:
 * - Ctrl+Enter で投稿
 * - ドラッグ&ドロップ画像選択
 */
export const DiaryForm = ({ onSuccess, onCancel }: DiaryFormProps) => {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const { isSubmitting, error, submit } = useDiarySubmit();

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    const success = await submit(content.trim(), selectedImage?.file ?? null);
    if (success) {
      setContent("");
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.preview);
      }
      setSelectedImage(null);
      onSuccess?.();
    }
  }, [canSubmit, content, selectedImage, submit, onSuccess]);

  // Ctrl+Enter キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canSubmit) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canSubmit, handleSubmit]);

  const handleImageSelect = (file: File) => {
    // 古いプレビューURLを解放
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage({
      file,
      preview: URL.createObjectURL(file),
    });
  };

  const handleImageRemove = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
  };

  // コンポーネントアンマウント時にプレビューURLを解放
  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.preview);
      }
    };
  }, [selectedImage]);

  return (
    <div className="space-y-6">
      <Textarea
        placeholder="出来事を世界に刻みましょう"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        minRows={6}
        isDisabled={isSubmitting}
        autoFocus
        classNames={{
          inputWrapper: "bg-gray-100 border-gray-300",
          input: "text-gray-900 placeholder:text-gray-500",
        }}
      />

      <ImageUpload
        selectedImage={selectedImage}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        isDisabled={isSubmitting}
      />

      {error && (
        <div className="rounded-lg bg-danger/10 p-3">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">Ctrl+Enter で投稿</span>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="light"
              onPress={onCancel}
              isDisabled={isSubmitting}
            >
              キャンセル
            </Button>
          )}
          <Button
            className="bg-[#D6B575] font-medium text-black"
            onPress={handleSubmit}
            isDisabled={!canSubmit}
            isLoading={isSubmitting}
          >
            書き記す
          </Button>
        </div>
      </div>
    </div>
  );
};
