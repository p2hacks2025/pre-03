import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const createDbClient = (connectionString: string) => {
  const client = postgres(connectionString, {
    max: 5,
    fetch_types: false,
    prepare: true,
  });
  return drizzle(client, { schema });
};

export type DbClient = ReturnType<typeof createDbClient>;
