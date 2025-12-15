import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");

function setupEnvFiles() {
  const envPaths = [
    { example: "apps/api/.env.example", target: "apps/api/.env" },
    { example: "apps/web/.env.example", target: "apps/web/.env" },
    { example: "apps/native/.env.example", target: "apps/native/.env" },
  ];

  for (const { example, target } of envPaths) {
    const targetPath = join(ROOT_DIR, target);
    if (!existsSync(targetPath)) {
      copyFileSync(join(ROOT_DIR, example), targetPath);
      console.log(`✓ Created ${target}`);
    } else {
      console.warn(`⚠ ${target} already exists, skipping`);
    }
  }
}

async function main() {
  console.log("\n🚀 Setting up workspace...\n");

  setupEnvFiles();

  console.log("\n✅ Workspace setup completed!\n");
  console.log("Next steps:");
  console.log("  1. Run `pnpm db:setup` to setup database");
  console.log("  2. Run `pnpm dev` to start development server\n");
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
