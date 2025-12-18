/**
 * Supabase 関連処理
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { log, warn } from "./logger.mjs";
import { ROOT_DIR, SUPABASE_ENV_TARGETS } from "./paths.mjs";

/**
 * 環境変数キーと Supabase status キーのマッピング
 */
export const SUPABASE_MAPPINGS = {
  DATABASE_URL: "DB_URL",
  SUPABASE_URL: "API_URL",
  SUPABASE_ANON_KEY: "ANON_KEY",
  SUPABASE_SERVICE_ROLE_KEY: "SERVICE_ROLE_KEY",
  CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE: "DB_URL",
};

/**
 * Supabase status を取得
 * @returns {object|null} status オブジェクト、実行中でなければ null
 */
export const getSupabaseStatus = () => {
  try {
    const output = execSync("pnpm exec supabase status --output json", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return JSON.parse(output);
  } catch {
    warn("Supabase is not running, skipping Supabase config injection");
    return null;
  }
};

/**
 * Supabase が実行中かどうかを確認
 * @returns {boolean}
 */
export const isSupabaseRunning = () => {
  try {
    execSync("pnpm exec supabase status", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
};

/**
 * Supabase が実行中でなければ起動
 */
export const ensureSupabaseRunning = () => {
  if (isSupabaseRunning()) {
    log("Supabase is running");
    return;
  }

  log("Starting Supabase...");
  execSync("pnpm exec supabase start", { stdio: "inherit" });
  log("Supabase started");
};

/**
 * execSync 用の環境変数オブジェクトを生成
 * @param {object} status - Supabase status オブジェクト
 * @returns {object} 環境変数オブジェクト
 */
export const buildEnvOverrides = (status) => {
  return {
    DATABASE_URL: status.DB_URL,
    SUPABASE_URL: status.API_URL,
    SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
  };
};

/**
 * .env ファイルに Supabase 設定を注入
 * @param {object} status - Supabase status オブジェクト
 * @param {string[]} [targets] - 注入対象ファイルパス（デフォルト: SUPABASE_ENV_TARGETS）
 */
export const injectSupabaseConfig = (
  status,
  targets = SUPABASE_ENV_TARGETS,
) => {
  for (const target of targets) {
    const envPath = join(ROOT_DIR, target);
    try {
      let envContent = readFileSync(envPath, "utf-8");

      for (const [envKey, statusKey] of Object.entries(SUPABASE_MAPPINGS)) {
        const value = status[statusKey];
        if (!value) continue;

        const regex = new RegExp(`^${envKey}=.*$`, "m");
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${envKey}=${value}`);
        }
      }

      writeFileSync(envPath, envContent);
      log(`Injected Supabase config into ${target}`);
    } catch {
      warn(`Skipped Supabase config injection for ${target} (file not found)`);
    }
  }
};
