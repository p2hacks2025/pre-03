export interface ProfileStats {
  streakDays: number;
}

/**
 * プロフィール統計情報を取得するフック
 *
 * TODO: API から実際の連続記録を取得する
 */
export const useProfileStats = (): ProfileStats => {
  return { streakDays: 7 };
};
