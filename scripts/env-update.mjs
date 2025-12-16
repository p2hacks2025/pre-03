import { execSync } from "node:child_process";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");

const ENV_TARGETS = ["apps/api", "apps/web", "apps/native", "apps/worker"];

const SUPABASE_MAPPINGS = {
  DATABASE_URL: "DB_URL",
  SUPABASE_URL: "API_URL",
  SUPABASE_ANON_KEY: "ANON_KEY",
  SUPABASE_SERVICE_ROLE_KEY: "SERVICE_ROLE_KEY",
  CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE: "DB_URL",
};

function log(message) {
  console.log(`✓ ${message}`);
}

function warn(message) {
  console.log(`⚠ ${message}`);
}

function error(message) {
  console.error(`✗ ${message}`);
}

function copyEnvFiles() {
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
}

function getSupabaseStatus() {
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
}

function injectSupabaseConfig(status) {
  const targets = ["apps/api/.env", "apps/worker/.env"];

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
}

async function main() {
  console.log("\n🔄 Updating .env files...\n");

  copyEnvFiles();

  const status = getSupabaseStatus();
  if (status) {
    injectSupabaseConfig(status);
  }

  console.log("\n✅ .env files updated!\n");
}

main().catch((err) => {
  error(err.message);
  process.exit(1);
});
