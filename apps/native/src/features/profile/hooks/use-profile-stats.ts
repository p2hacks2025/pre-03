export interface ProfileStats {
  /** 連続日数 */
  streakDays: number;
}

/**
 * プロフィール統計を取得するフック
 *
 * 現時点ではモック値を返す。
 * 将来的には API から投稿データを取得して計算する。
 */
export const useProfileStats = (): ProfileStats => {
  // TODO: API から実際の連続記録を取得する
  return {
    streakDays: 7,
  };
};
