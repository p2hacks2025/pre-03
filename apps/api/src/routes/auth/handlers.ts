import type { AppRouteHandler } from "@/context";
import { createSupabaseClient } from "@/infrastructure/supabase";
import { deleteAccessTokenCookie, setAccessTokenCookie } from "@/shared/cookie";
import { login, logout, passwordReset, signup } from "@/usecase/auth";
import type {
  loginRoute,
  logoutRoute,
  passwordResetRoute,
  signupRoute,
} from "./route";

export const signupHandler: AppRouteHandler<typeof signupRoute> = async (c) => {
  const input = c.req.valid("json");
  const supabase = createSupabaseClient(c.env);
  const db = c.get("db");

  const result = await signup({ supabase, db }, input);

  // Cookie にアクセストークンを設定
  setAccessTokenCookie(c, result.session.accessToken, result.session.expiresAt);

  return c.json(result);
};

export const loginHandler: AppRouteHandler<typeof loginRoute> = async (c) => {
  const input = c.req.valid("json");
  const supabase = createSupabaseClient(c.env);

  const result = await login({ supabase }, input);

  // Cookie にアクセストークンを設定
  setAccessTokenCookie(c, result.session.accessToken, result.session.expiresAt);

  return c.json(result);
};

export const logoutHandler: AppRouteHandler<typeof logoutRoute> = async (c) => {
  const supabase = c.get("supabase");

  const result = await logout({ supabase });

  // Cookie を削除
  deleteAccessTokenCookie(c);

  return c.json(result);
};

export const passwordResetHandler: AppRouteHandler<
  typeof passwordResetRoute
> = async (c) => {
  const input = c.req.valid("json");
  const supabase = createSupabaseClient(c.env);

  const result = await passwordReset({ supabase }, input);

  return c.json(result);
};
