/**
 * プロフィール機能で使用するカラー定義
 *
 * 各コンポーネントで分散していたカラーを一元管理
 */
export const PROFILE_COLORS = {
  // 背景
  background: "#4ECCDD",
  card: "#FFFFFF",
  cardSecondary: "#F1F1F1",

  // アクセント
  gold: "#C4A86C",
  goldButton: "#D6B575",

  // テキスト
  textPrimary: "#333333",
  textSecondary: "#888888",
  textWhite: "#FFFFFF",

  // ボーダー・影
  divider: "#E5E5E5",
  shadow: "#000000",
} as const;
