import type { Context, Next } from "hono";
import type { Bindings, Variables } from "@/context";
import { getDb } from "@/infrastructure/db";

export const dbMiddleware = async (
  c: Context<{
    Bindings: Bindings;
    Variables: Variables;
  }>,
  next: Next,
) => {
  const db = getDb(c.env);
  c.set("db", db);
  await next();
};
