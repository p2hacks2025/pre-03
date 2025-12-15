import { createDbClient } from "@packages/db";
import type { Bindings } from "@/context";

export const getDb = (env: Bindings) => {
  const db = createDbClient(env.HYPERDRIVE.connectionString);
  return db;
};
