import { dbKeys } from "@packages/env";
import { createEnv } from "@t3-oss/env-core";
import { defineConfig } from "drizzle-kit";

const env = createEnv({
  server: dbKeys,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export default defineConfig({
  schema: [
    "./src/schema/ai-posts.ts",
    "./src/schema/ai-profiles.ts",
    "./src/schema/relations.ts",
    "./src/schema/user-posts.ts",
    "./src/schema/user-profiles.ts",
    "./src/schema/weekly-worlds.ts",
    "./src/schema/world-build-logs.ts",
    // auth.ts は Supabase 管理のため除外
  ],
  out: "../../supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
