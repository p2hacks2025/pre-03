import type { ReactNode } from "react";
import type { Animated } from "react-native";

export interface HeaderProps {
  /** ヘッダータイトル */
  title: string;

  /** サブタイトル（オプション） */
  subtitle?: string;

  /** 左側コンテンツ（アイコンボタン等） */
  leftContent?: ReactNode;

  /** 右側コンテンツ（アイコンボタン等） */
  rightContent?: ReactNode;

  /** スクロール連動アニメーションの有無 */
  animated?: boolean;

  /** アニメーション用スクロール位置（animated=true時に必須） */
  scrollY?: Animated.Value;

  /** 背景色のカスタマイズ（デフォルト: bg-white） */
  backgroundColor?: string;

  /** 下部ボーダーの表示 */
  showBorder?: boolean;
}
