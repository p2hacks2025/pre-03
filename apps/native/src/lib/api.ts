import { createClient } from "@packages/api-contract";
import { env } from "./env";

/**
 * 認証不要エンドポイント用クライアント
 * ヘルスチェックなど公開APIに使用
 */
export const client = createClient(env.API_BASE_URL);

/**
 * 認証付きクライアント生成関数
 * @param accessToken - Bearer トークン
 */
export const createAuthenticatedClient = (accessToken: string) => {
  return createClient(env.API_BASE_URL, {
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      }),
  });
};
