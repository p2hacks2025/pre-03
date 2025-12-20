/**
 * シェア画像のレイアウト定数
 *
 * ベース画像（share.png）に動的要素を重ねるための位置・サイズ定義
 * 画像サイズ: 1920 x 1080 (16:9)
 */

/** ベース画像のサイズ（レイアウト用） */
export const SHARE_IMAGE = {
  /** 画像幅 */
  WIDTH: 1920,
  /** 画像高さ */
  HEIGHT: 1080,
} as const;

/** 出力画像の設定 */
export const SHARE_OUTPUT = {
  /** 出力画像幅 */
  WIDTH: 1920,
  /** 出力画像高さ */
  HEIGHT: 1080,
} as const;

/** 週間ワールド画像の配置 */
export const WORLD_IMAGE = {
  /** 左からの位置 */
  LEFT: 80,
  /** 上からの位置 */
  TOP: 250,
  /** 画像サイズ（正方形） */
  SIZE: 800,
} as const;

/** 統計カードの配置 */
export const STATS_CARD = {
  /** 右からの位置 */
  RIGHT: 110,
  /** 上からの位置 */
  TOP: 280,
  /** カード幅 */
  WIDTH: 810,
  /** 角丸の半径 */
  BORDER_RADIUS: 24,
  /** パディング（水平） */
  PADDING_HORIZONTAL: 64,
  /** パディング（垂直） */
  PADDING_VERTICAL: 64,
  /** 影の設定 */
  SHADOW: {
    COLOR: "#000000",
    OFFSET_X: 0,
    OFFSET_Y: 8,
    OPACITY: 0.15,
    RADIUS: 24,
    ELEVATION: 12,
  },
} as const;

/** アバターのサイズ */
export const AVATAR = {
  /** アバターサイズ */
  SIZE: 120,
  /** 枠線の幅 */
  BORDER_WIDTH: 4,
} as const;

/** 統計アイテムのスタイル */
export const STAT_ITEM = {
  /** ラベルのフォントサイズ */
  LABEL_FONT_SIZE: 28,
  /** 値のフォントサイズ */
  VALUE_FONT_SIZE: 56,
  /** 単位のフォントサイズ */
  UNIT_FONT_SIZE: 32,
} as const;

/** シェア画像用カラー */
export const SHARE_COLORS = {
  /** カード背景 */
  CARD_BACKGROUND: "#FFFFFF",
  /** テキスト（主） */
  TEXT_PRIMARY: "#333333",
  /** テキスト（副） */
  TEXT_SECONDARY: "#666666",
  /** 区切り線 */
  DIVIDER: "#E5E5E5",
  /** アバター枠 */
  AVATAR_BORDER: "#E0E0E0",
} as const;
