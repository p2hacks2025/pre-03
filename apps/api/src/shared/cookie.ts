import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import type { Bindings, Variables } from "@/context";

export const COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

/** refreshToken Cookie の有効期限（30日） */
const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

type CookieContext = Context<{ Bindings: Bindings; Variables: Variables }>;

/**
 * 本番環境かどうかを判定
 */
const isProduction = (c: CookieContext): boolean => {
  const env = c.get("env");
  return env.ENVIRONMENT === "production";
};

/**
 * アクセストークンを HttpOnly Cookie に設定
 * @param c - Hono Context
 * @param accessToken - アクセストークン
 * @param expiresAt - トークンの有効期限（Unixタイムスタンプ秒）
 */
export const setAccessTokenCookie = (
  c: CookieContext,
  accessToken: string,
  expiresAt: number,
): void => {
  const maxAge = Math.max(0, expiresAt - Math.floor(Date.now() / 1000));

  setCookie(c, COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction(c),
    sameSite: "Lax",
    path: "/",
    maxAge,
  });
};

/**
 * アクセストークン Cookie を削除
 */
export const deleteAccessTokenCookie = (c: CookieContext): void => {
  deleteCookie(c, COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction(c),
    sameSite: "Lax",
    path: "/",
  });
};

/**
 * リフレッシュトークンを HttpOnly Cookie に設定
 * @param c - Hono Context
 * @param refreshToken - リフレッシュトークン
 */
export const setRefreshTokenCookie = (
  c: CookieContext,
  refreshToken: string,
): void => {
  setCookie(c, REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction(c),
    sameSite: "Lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
};

/**
 * リフレッシュトークン Cookie を削除
 */
export const deleteRefreshTokenCookie = (c: CookieContext): void => {
  deleteCookie(c, REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction(c),
    sameSite: "Lax",
    path: "/",
  });
};
