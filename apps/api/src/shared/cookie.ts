import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import type { Bindings, Variables } from "@/context";

export const COOKIE_NAME = "access_token";

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
