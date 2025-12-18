/**
 * パス定義・定数
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** プロジェクトルートディレクトリ */
export const ROOT_DIR = join(__dirname, "../..");

/** .env ファイル対象ディレクトリ一覧 */
export const ENV_TARGETS = [
  "apps/api",
  "apps/web",
  "apps/native",
  "apps/worker",
];

/** Supabase 設定注入対象ファイル */
export const SUPABASE_ENV_TARGETS = ["apps/api/.env", "apps/worker/.env"];
