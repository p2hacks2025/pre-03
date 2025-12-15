import type { Context, Next } from "hono";
import { getEnv } from "@/config/env";
import type { Bindings, Variables } from "@/context";

export const envMiddleware = async (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next,
) => {
  const parsed = getEnv(c.env);
  c.set("env", parsed);
  await next();
};
