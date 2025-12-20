/**
 * エントリー（日記）
 */
export interface Entry {
  id: string;
  postedAt: Date;
  content: string;
  imageUrl?: string;
}

/**
 * プロフィール名更新のパラメータ
 */
export interface UpdateProfileNameParams {
  displayName: string;
}

/**
 * プロフィール編集の状態
 */
export interface ProfileEditState {
  isEditing: boolean;
  isSaving: boolean;
  /** 編集中の表示名（下書き） */
  draftDisplayName: string;
}

/**
 * プロフィール編集のアクション
 */
export interface ProfileEditActions {
  startEdit: () => void;
  cancelEdit: () => void;
  setDraftDisplayName: (name: string) => void;
  saveEdit: () => Promise<void>;
}

/**
 * useProfileEdit の戻り値
 */
export interface UseProfileEditReturn
  extends ProfileEditState,
    ProfileEditActions {
  inputRef: React.RefObject<import("react-native").TextInput | null>;
}
