"use client";

import { useState } from "react";
import { postMultipart } from "@packages/api-contract";

import { useAuth } from "@/contexts/auth-context";
import { client } from "@/lib/api";
import { logger } from "@/lib/logger";

import type { UploadAvatarOutput } from "@packages/schema/user";

export interface UseProfileAvatarReturn {
  isUploading: boolean;
  uploadAvatar: (file: File) => Promise<void>;
}

/**
 * プロフィールアバターアップロード用フック
 */
export const useProfileAvatar = (): UseProfileAvatarReturn => {
  const { updateProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);

    try {
      logger.debug("Uploading avatar", {
        fileName: file.name,
        size: file.size,
      });

      const formData = new FormData();
      formData.append("file", file);

      const result = await postMultipart<UploadAvatarOutput>(
        client.user.avatar,
        formData,
      );

      logger.info("Avatar uploaded", { avatarUrl: result.avatarUrl });
      updateProfile({ avatarUrl: result.avatarUrl });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Avatar upload error", {}, err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadAvatar,
  };
};
