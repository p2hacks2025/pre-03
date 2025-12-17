import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { error, log, printDirenvReloadMessage, warn } from "./lib/logger.mjs";
import { ENV_TARGETS, ROOT_DIR } from "./lib/paths.mjs";

function setupEnvFiles() {
  for (const target of ENV_TARGETS) {
    const examplePath = join(ROOT_DIR, target, ".env.example");
    const targetPath = join(ROOT_DIR, target, ".env");

    if (!existsSync(targetPath)) {
      copyFileSync(examplePath, targetPath);
      log(`Created ${target}/.env`);
    } else {
      warn(`${target}/.env already exists, skipping`);
    }
  }
}

async function main() {
  console.log("\n🚀 Setting up workspace...\n");

  setupEnvFiles();

  console.log("\n✅ Workspace setup completed!");
  printDirenvReloadMessage();

  console.log("Next steps:");
  console.log("  1. Run `pnpm db:setup` to setup database");
  console.log("  2. Run `pnpm dev` to start development server\n");
}

main().catch((err) => {
  error(err.message);
  process.exit(1);
});
