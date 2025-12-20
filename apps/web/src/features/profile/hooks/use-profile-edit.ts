"use client";

import { useRef, useState } from "react";
import { ErrorResponseSchema } from "@packages/schema/common/error";

import { useAuth } from "@/contexts/auth-context";
import { client } from "@/lib/api";
import { logger } from "@/lib/logger";

export interface UseProfileEditReturn {
  isEditing: boolean;
  isSaving: boolean;
  editName: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  startEdit: () => void;
  cancelEdit: () => void;
  setEditName: (name: string) => void;
  saveEdit: () => Promise<void>;
}

/**
 * プロフィール名編集用フック
 */
export const useProfileEdit = (): UseProfileEditReturn => {
  const { profile, updateProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState("");

  const startEdit = () => {
    if (profile) {
      setEditName(profile.displayName);
      setIsEditing(true);
      // 次のフレームでフォーカス
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditName("");
  };

  const saveEdit = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      cancelEdit();
      return;
    }

    // 変更がない場合はスキップ
    if (trimmedName === profile?.displayName) {
      cancelEdit();
      return;
    }

    setIsSaving(true);

    try {
      logger.debug("Updating profile name", { displayName: trimmedName });

      const res = await client.user.profile.update.$post({
        json: { displayName: trimmedName },
      });

      if (res.ok) {
        logger.info("Profile name updated");
        updateProfile({ displayName: trimmedName });
        setIsEditing(false);
        setEditName("");
      } else {
        const errorData = ErrorResponseSchema.parse(await res.json());
        logger.warn("Profile update failed", {
          error: errorData.error.message,
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Profile update error", {}, err);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    isSaving,
    editName,
    inputRef,
    startEdit,
    cancelEdit,
    setEditName,
    saveEdit,
  };
};
