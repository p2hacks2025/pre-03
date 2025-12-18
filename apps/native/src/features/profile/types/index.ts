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
  editName: string;
}

/**
 * プロフィール編集のアクション
 */
export interface ProfileEditActions {
  startEdit: () => void;
  cancelEdit: () => void;
  setEditName: (name: string) => void;
  saveEdit: () => Promise<void>;
}
