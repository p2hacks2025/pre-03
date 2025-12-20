"use client";

import { useState } from "react";
import { postMultipart } from "@packages/api-contract";

import { client } from "@/lib/api";
import { clientLogger as logger } from "@/lib/logger-client";

import type { CreateEntryOutput } from "@packages/schema/entry";

export interface UseDiarySubmitReturn {
  isSubmitting: boolean;
  error: string | null;
  submit: (content: string, image: File | null) => Promise<boolean>;
}

/**
 * 日記投稿用フック
 */
export const useDiarySubmit = (): UseDiarySubmitReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    content: string,
    image: File | null,
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      logger.debug("Submitting diary entry", {
        contentLength: content.length,
        hasImage: !!image,
      });

      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("file", image);
      }

      await postMultipart<CreateEntryOutput>(client.entries, formData);

      logger.info("Diary entry submitted successfully");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "投稿に失敗しました";
      logger.error("Diary submit error", { message });
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    submit,
  };
};
