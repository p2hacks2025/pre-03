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
    fetch: (url, init) => {
      // Headers オブジェクトを正しくマージ
      // Hono RPC は Headers オブジェクトを渡すため、スプレッドでは展開されない
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${accessToken}`);

      return fetch(url, {
        ...init,
        headers,
      });
    },
  });
};
