import { useToast } from "heroui-native";
import { useRef, useState } from "react";
import type { TextInput } from "react-native";

import { useAuth } from "@/contexts/auth-context";

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
 * 現在はローカル更新のみ（mock）。
 * 将来的にはAPIを叩いてサーバー側にも保存する。
 *
 * @example 将来的なAPI呼び出しの実装例
 * ```typescript
 * const authClient = createAuthenticatedClient(accessToken);
 * const res = await authClient.user.profile.$patch({
 *   json: { displayName: params.displayName }
 * });
 * if (!res.ok) throw new Error('Failed to update profile');
 * ```
 */
async function saveProfileName(
  params: UpdateProfileNameParams,
  updateProfile: (updates: { displayName: string }) => void,
): Promise<void> {
  // TODO: APIを叩いてサーバー側にも保存する
  // 現在はローカル更新のみ（mock）
  updateProfile({ displayName: params.displayName });

  // 将来的にはここでAPIレスポンスを待つ
  // await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * プロフィール編集ロジックを管理するフック
 *
 * 編集モードの状態管理、バリデーション、保存処理を提供。
 * UIコンポーネントから編集ロジックを分離するために使用。
 */
export const useProfileEdit = (): UseProfileEditReturn => {
  const { profile, updateProfile } = useAuth();
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

    setIsSaving(true);
    try {
      await saveProfileName({ displayName: trimmedName }, updateProfile);
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
