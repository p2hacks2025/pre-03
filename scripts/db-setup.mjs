import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");

function log(message) {
  console.log(`✓ ${message}`);
}
function warn(message) {
  console.log(`⚠ ${message}`);
}
function error(message) {
  console.error(`✗ ${message}`);
}

function ensureSupabaseRunning() {
  try {
    execSync("pnpm exec supabase status", { stdio: "pipe" });
    log("Supabase is running");
    return true;
  } catch {
    log("Starting Supabase...");
    execSync("pnpm exec supabase start", { stdio: "inherit" });
    log("Supabase started");
    return true;
  }
}

function updateEnvWithSupabaseConfig() {
  const output = execSync("pnpm exec supabase status --output json", {
    encoding: "utf-8",
  });
  const status = JSON.parse(output);

  const apiEnvPath = join(ROOT_DIR, "apps/api/.env");
  let apiEnv = readFileSync(apiEnvPath, "utf-8");

  const updates = {
    DATABASE_URL: status.DB_URL,
    SUPABASE_URL: status.API_URL,
    SUPABASE_ANON_KEY: status.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE: status.DB_URL,
  };

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(apiEnv)) {
      apiEnv = apiEnv.replace(regex, `${key}=${value}`);
    }
  }

  writeFileSync(apiEnvPath, apiEnv);
  log("Updated apps/api/.env with Supabase config");
}

function runMigration() {
  log("Running database migration...");
  try {
    execSync("pnpm db:migrate", {
      stdio: ["inherit", "inherit", "pipe"],
      cwd: ROOT_DIR,
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
}

function runSeed() {
  log("Running database seed...");
  try {
    execSync("pnpm db:seed", {
      stdio: "inherit",
      cwd: ROOT_DIR,
    });
    log("Seed completed");
  } catch (_err) {
    warn("Seed failed or already applied");
  }
}

async function main() {
  console.log("\n🗄️  Setting up database environment...\n");

  ensureSupabaseRunning();
  updateEnvWithSupabaseConfig();
  runMigration();
  runSeed();

  console.log("\n✅ Database setup completed!\n");
}

main().catch((err) => {
  error(err.message);
  process.exit(1);
});
