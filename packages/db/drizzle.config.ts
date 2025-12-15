import { dbKeys } from "@packages/env";
import { createEnv } from "@t3-oss/env-core";
import { defineConfig } from "drizzle-kit";

const env = createEnv({
  server: dbKeys,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export default defineConfig({
  schema: "./src/schema",
  out: "../../supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
