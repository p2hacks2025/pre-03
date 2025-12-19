import { ErrorResponseSchema } from "@packages/schema/common/error";
import { useToast } from "heroui-native";
import { useRef, useState } from "react";
import type { TextInput } from "react-native";

import { useAuth } from "@/contexts/auth-context";
import { createAuthenticatedClient } from "@/lib/api";

import type {
  ProfileEditActions,
  ProfileEditState,
  UpdateProfileNameParams,
} from "../types";

export interface UseProfileEditReturn
  extends ProfileEditState,
    ProfileEditActions {
  inputRef: React.RefObject<TextInput | null>;
}

/**
 * プロフィール名を保存
 *
 * APIを叩いてサーバー側に保存し、成功後にローカルstateも更新する。
 */
async function saveProfileName(
  params: UpdateProfileNameParams,
  updateProfile: (updates: { displayName: string }) => void,
  accessToken: string,
): Promise<void> {
  const authClient = createAuthenticatedClient(accessToken);

  const res = await authClient.user.profile.update.$post({
    json: { displayName: params.displayName },
  });

  if (!res.ok) {
    const errorData = ErrorResponseSchema.parse(await res.json());
    throw new Error(errorData.error.message);
  }

  // API成功後にローカルstateも更新
  const data = await res.json();
  updateProfile({ displayName: data.profile.displayName });
}

/**
 * プロフィール編集ロジックを管理するフック
 *
 * 編集モードの状態管理、バリデーション、保存処理を提供。
 * UIコンポーネントから編集ロジックを分離するために使用。
 */
export const useProfileEdit = (): UseProfileEditReturn => {
  const { profile, updateProfile, accessToken } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState(profile?.displayName ?? "");
  const inputRef = useRef<TextInput | null>(null);

  const startEdit = () => {
    if (!profile) return;
    setEditName(profile.displayName);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const cancelEdit = () => {
    if (!profile) return;
    setEditName(profile.displayName);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!profile) return;

    const trimmedName = editName.trim();

    if (!trimmedName) {
      toast.show({
        variant: "warning",
        label: "名前を入力してください",
      });
      return;
    }

    if (trimmedName === profile.displayName) {
      setIsEditing(false);
      return;
    }

    if (!accessToken) {
      toast.show({
        variant: "danger",
        label: "認証エラー",
        description: "再度ログインしてください",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveProfileName(
        { displayName: trimmedName },
        updateProfile,
        accessToken,
      );
      setIsEditing(false);
      toast.show({
        variant: "success",
        label: "名前を更新しました",
      });
    } catch (error) {
      toast.show({
        variant: "danger",
        label: "更新に失敗しました",
        description:
          error instanceof Error ? error.message : "もう一度お試しください",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    isSaving,
    editName,
    startEdit,
    cancelEdit,
    setEditName,
    saveEdit,
    inputRef,
  };
};
