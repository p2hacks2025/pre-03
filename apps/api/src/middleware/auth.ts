import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import type { Bindings, Variables } from "@/context";
import { createSupabaseClient } from "@/infrastructure/supabase";
import { COOKIE_NAME } from "@/shared/cookie";
import { AppError } from "@/shared/error/app-error";

export const authMiddleware = async (
  c: Context<{
    Bindings: Bindings;
    Variables: Variables;
  }>,
  next: Next,
) => {
  const authHeader = c.req.header("Authorization");
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = getCookie(c, COOKIE_NAME);
  }

  if (!token) {
    throw new AppError("UNAUTHORIZED", {
      message: "Authorization token is required",
    });
  }

  const supabase = createSupabaseClient(c.env);

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new AppError("UNAUTHORIZED", {
      message: "Invalid or expired authorization token",
    });
  }

  c.set("supabase", supabase);
  c.set("user", data.user);

  await next();
};
