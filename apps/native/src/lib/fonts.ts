import {
  DotGothic16_400Regular,
  useFonts as useDotGothicFonts,
} from "@expo-google-fonts/dotgothic16";
import { useFonts } from "expo-font";

/**
 * フォントファミリー名の定数定義
 * 型安全にフォント名を参照できる
 */
export const FONT_FAMILY = {
  /** 日記・本文用（ユーザー投稿） */
  ZEN_KURENAIDO: "ZenKurenaido-Regular",
  /** AI投稿・タイムスタンプ用 */
  DOT_GOTHIC: "DotGothic16_400Regular",
  /** 見出し・タイトル用 */
  MADOUFMG: "Madoufmg",
} as const;

/** フォントファミリー名の型 */
export type FontFamily = (typeof FONT_FAMILY)[keyof typeof FONT_FAMILY];

/**
 * ローカルフォントリソースのマップ
 * useFonts に渡す形式
 */
const LOCAL_FONT_RESOURCES = {
  [FONT_FAMILY.ZEN_KURENAIDO]: require("../../assets/fonts/ZenKurenaido-Regular.ttf"),
  [FONT_FAMILY.MADOUFMG]: require("../../assets/fonts/madoufmg.ttf"),
};

/**
 * Google Fonts リソース
 */
const GOOGLE_FONT_RESOURCES = {
  DotGothic16_400Regular,
};

/**
 * 全フォントを読み込むカスタムフック
 * _layout.tsx で使用する
 *
 * @returns フォント読み込み完了状態
 */
export const useAppFonts = (): boolean => {
  const [localFontsLoaded] = useFonts(LOCAL_FONT_RESOURCES);
  const [googleFontsLoaded] = useDotGothicFonts(GOOGLE_FONT_RESOURCES);

  return localFontsLoaded && googleFontsLoaded;
};
