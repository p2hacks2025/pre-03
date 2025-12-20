/**
 * フォントファミリー名の定数定義
 * CSS変数経由でフォント名を参照できる
 */
export const FONT_FAMILY = {
  /** 日記・本文用（ユーザー投稿） */
  ZEN_KURENAIDO: "var(--font-zen-kurenaido)",
  /** AI投稿・タイムスタンプ用 */
  DOT_GOTHIC: "var(--font-dot-gothic)",
  /** 見出し・タイトル用 */
  MADOUFMG: "var(--font-madoufmg)",
} as const;

/** フォントファミリー名の型 */
export type FontFamily = (typeof FONT_FAMILY)[keyof typeof FONT_FAMILY];
