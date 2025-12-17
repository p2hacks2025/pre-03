import { createClient } from "@supabase/supabase-js";
import { createDbClient } from "../client";
import { runSeeders } from "./runner";
import type { SeedOptions } from "./seeders";

// Infrastructure seeders（インフラ初期化）
import { storageSeeder } from "./seeders/storage";

// Data seeders（データ初期化）
import { usersSeeder } from "./seeders/users";
import { weeklyWorldsSeeder } from "./seeders/weekly-worlds";
import { workerPostsSeeder } from "./seeders/worker-posts";

const parseArgs = (): SeedOptions => {
  const args = process.argv.slice(2);
  return {
    force: args.includes("--force") || args.includes("-f"),
    reset: args.includes("--reset") || args.includes("-r"),
  };
};

const validateEnv = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is required");
  }
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return { supabaseUrl, serviceRoleKey, databaseUrl };
};

const main = async () => {
  const options = parseArgs();
  const { supabaseUrl, serviceRoleKey, databaseUrl } = validateEnv();

  // Admin client (SERVICE_ROLE_KEY使用)
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
  const db = createDbClient(databaseUrl);

  console.log("Starting seed...");
  console.log(`Options: force=${options.force}, reset=${options.reset}`);

  /**
   * シーダー一覧
   *
   * 実行順序:
   * 1. Infrastructure seeders（バケット、RLSポリシーなど）
   * 2. Data seeders（テストユーザーなど）
   */
  const seeders = [
    storageSeeder,
    usersSeeder,
    weeklyWorldsSeeder,
    workerPostsSeeder,
  ];

  await runSeeders(seeders, {
    db,
    adminSupabase,
    options,
  });

  console.log("Seed completed!");
  process.exit(0);
};

// CLI実行用
main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
