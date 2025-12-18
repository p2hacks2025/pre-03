import { execSync } from "node:child_process";
import { error, log, printDirenvReloadMessage, warn } from "./lib/logger.mjs";
import { ROOT_DIR } from "./lib/paths.mjs";
import {
  buildEnvOverrides,
  ensureSupabaseRunning,
  getSupabaseStatus,
  injectSupabaseConfig,
} from "./lib/supabase.mjs";

/**
 * マイグレーションを実行
 * @param {object} envOverrides - 環境変数オーバーライド
 */
const runMigration = (envOverrides) => {
  log("Running database migration...");
  try {
    execSync("pnpm db:migrate", {
      stdio: ["inherit", "inherit", "pipe"],
      cwd: ROOT_DIR,
      env: { ...process.env, ...envOverrides },
    });
    log("Migration completed");
  } catch (err) {
    const stderr = err.stderr?.toString() || "";
    if (stderr.includes("already exists")) {
      warn("Database already set up, skipping migration");
    } else {
      if (stderr) console.error(stderr);
      throw err;
    }
  }
};

/**
 * シードを実行
 * @param {object} envOverrides - 環境変数オーバーライド
 */
const runSeed = (envOverrides) => {
  log("Running database seed...");
  try {
    execSync("pnpm db:seed", {
      stdio: "inherit",
      cwd: ROOT_DIR,
      env: { ...process.env, ...envOverrides },
    });
    log("Seed completed");
  } catch (_err) {
    warn("Seed failed or already applied");
  }
};

const main = async () => {
  console.log("\n🗄️  Setting up database environment...\n");

  ensureSupabaseRunning();

  const status = getSupabaseStatus();
  if (!status) {
    throw new Error("Failed to get Supabase status");
  }

  // .env ファイルを更新（次回以降の手動コマンド用）
  injectSupabaseConfig(status);

  // 環境変数を直接渡して migrate/seed を実行
  const envOverrides = buildEnvOverrides(status);
  runMigration(envOverrides);
  runSeed(envOverrides);

  console.log("\n✅ Database setup completed!");
  printDirenvReloadMessage();
};

main().catch((err) => {
  error(err.message);
  process.exit(1);
});
