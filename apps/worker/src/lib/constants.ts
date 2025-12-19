import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ASSETS_DIR = resolve(__dirname, "../../assets");
export const TIMEZONE = "Asia/Tokyo";
export const JST_OFFSET = 9 * 60 * 60 * 1000;
export const FIELD_ID_MIN = 0;
export const FIELD_ID_MAX = 8;
export const ONESIGNAL_API_URL = "https://api.onesignal.com/notifications";

/**
 * ダイヤモンド型9ブロックの位置記述
 *
 * 配置図:
 *            [0]              ← 1段目（トップ）
 *          [3] [1]            ← 2段目（左, 右）
 *        [6] [4] [2]          ← 3段目（左, 中央, 右）
 *          [7] [5]            ← 4段目（左, 右）
 *            [8]              ← 5段目（ボトム）
 */
export const FIELD_POSITIONS: Record<number, string> = {
  0: "1st tier from top (the single block at the very top)",
  1: "2nd tier from top, right side",
  2: "3rd tier (middle row), rightmost block",
  3: "2nd tier from top, left side",
  4: "3rd tier (middle row), center block",
  5: "4th tier from top, right side",
  6: "3rd tier (middle row), leftmost block",
  7: "4th tier from top, left side",
  8: "5th tier (the single block at the very bottom)",
};
