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

type BaseDbClient = ReturnType<typeof createDbClient>;

type TxClient = Parameters<Parameters<BaseDbClient["transaction"]>[0]>[0];

export type DbClient = BaseDbClient | TxClient;
