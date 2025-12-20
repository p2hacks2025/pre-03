export interface ProfileStats {
  /** 連続投稿日数 */
  streakDays: number;
  /** 投稿総数 */
  totalPosts: number;
  /** 作られた世界の数 */
  worldCount: number;
  /** ローディング状態 */
  isLoading: boolean;
}

/**
 * プロフィール統計を取得するフック
 *
 * 現時点ではモック値を返す。
 * 将来的には API から投稿データを取得して計算する。
 */
export const useProfileStats = (): ProfileStats => {
  // TODO: API から実際の統計を取得する
  return {
    streakDays: 9,
    totalPosts: 100,
    worldCount: 10,
    isLoading: false,
  };
};
