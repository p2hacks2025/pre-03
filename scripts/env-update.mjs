import { copyFileSync } from "node:fs";
import { join } from "node:path";
import { error, log, printDirenvReloadMessage, warn } from "./lib/logger.mjs";
import { ENV_TARGETS, ROOT_DIR } from "./lib/paths.mjs";
import { getSupabaseStatus, injectSupabaseConfig } from "./lib/supabase.mjs";

/**
 * .env.example を .env にコピー
 */
const copyEnvFiles = () => {
  for (const target of ENV_TARGETS) {
    const examplePath = join(ROOT_DIR, target, ".env.example");
    const envPath = join(ROOT_DIR, target, ".env");

    try {
      copyFileSync(examplePath, envPath);
      log(`Copied ${target}/.env.example -> ${target}/.env`);
    } catch (_err) {
      warn(`Skipped ${target} (no .env.example found)`);
    }
  }
};

const main = async () => {
  console.log("\n🔄 Updating .env files...\n");

  copyEnvFiles();

  const status = getSupabaseStatus();
  if (status) {
    injectSupabaseConfig(status);
  }

  console.log("\n✅ .env files updated!");
  printDirenvReloadMessage();
};

main().catch((err) => {
  error(err.message);
  process.exit(1);
});
