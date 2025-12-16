import { getCookie } from "hono/cookie";
import type { AppRouteHandler } from "@/context";
import { createSupabaseClient } from "@/infrastructure/supabase";
import {
  deleteAccessTokenCookie,
  deleteRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/shared/cookie";
import { login, logout, passwordReset, refresh, signup } from "@/usecase/auth";
import type {
  loginRoute,
  logoutRoute,
  passwordResetRoute,
  refreshRoute,
  signupRoute,
} from "./route";

export const signupHandler: AppRouteHandler<typeof signupRoute> = async (c) => {
  const input = c.req.valid("json");
  const supabase = createSupabaseClient(c.env);
  const db = c.get("db");

  const result = await signup({ supabase, db }, input);

  // Cookie にトークンを設定
  setAccessTokenCookie(c, result.session.accessToken, result.session.expiresAt);
  setRefreshTokenCookie(c, result.session.refreshToken);

  return c.json(result);
};

export const loginHandler: AppRouteHandler<typeof loginRoute> = async (c) => {
  const input = c.req.valid("json");
  const supabase = createSupabaseClient(c.env);

  const result = await login({ supabase }, input);

  // Cookie にトークンを設定
  setAccessTokenCookie(c, result.session.accessToken, result.session.expiresAt);
  setRefreshTokenCookie(c, result.session.refreshToken);

  return c.json(result);
};

export const logoutHandler: AppRouteHandler<typeof logoutRoute> = async (c) => {
  const supabase = c.get("supabase");

  const result = await logout({ supabase });

  // Cookie を削除
  deleteAccessTokenCookie(c);
  deleteRefreshTokenCookie(c);

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

export const refreshHandler: AppRouteHandler<typeof refreshRoute> = async (
  c,
) => {
  const input = c.req.valid("json");
  const supabase = createSupabaseClient(c.env);

  // Cookie からリフレッシュトークンを取得（Web 用）
  const cookieRefreshToken = getCookie(c, REFRESH_COOKIE_NAME);

  const result = await refresh(
    { supabase },
    {
      ...input,
      cookieRefreshToken,
    },
  );

  // Cookie を更新
  setAccessTokenCookie(c, result.session.accessToken, result.session.expiresAt);
  setRefreshTokenCookie(c, result.session.refreshToken);

  return c.json(result);
};
