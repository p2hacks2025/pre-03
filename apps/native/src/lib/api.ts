import type { ApiClient } from "@packages/api-contract";
import { createClient } from "@packages/api-contract";
import { tokenManager } from "@/features/auth/lib/token-manager";
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

/**
 * 401自動リトライ付き認証クライアント生成関数
 *
 * - リクエスト前にトークン期限をチェック（期限が近ければ事前リフレッシュ）
 * - 401エラー時にリフレッシュして1回リトライ
 * - リフレッシュ失敗時はそのまま401を返す
 *
 * @param getAccessToken - 現在のアクセストークンを取得する関数
 * @param refreshToken - トークンをリフレッシュする関数（成功時 true を返す）
 */
export const createAuthenticatedClientWithRetry = (
  getAccessToken: () => Promise<string | null>,
  refreshToken: () => Promise<boolean>,
): ApiClient => {
  return createClient(env.API_BASE_URL, {
    fetch: async (url, init) => {
      // リクエスト前にトークン期限をチェック
      const isExpiringSoon = await tokenManager.isTokenExpiringSoon();
      if (isExpiringSoon) {
        await refreshToken();
      }

      // 現在のトークンを取得
      let accessToken = await getAccessToken();
      if (!accessToken) {
        // トークンがない場合は空のAuthorizationで進む（401が返る想定）
        return fetch(url, init);
      }

      // リクエスト実行
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${accessToken}`);

      const response = await fetch(url, {
        ...init,
        headers,
      });

      // 401エラーの場合はリフレッシュしてリトライ
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // 新しいトークンを取得
          accessToken = await getAccessToken();
          if (accessToken) {
            const retryHeaders = new Headers(init?.headers);
            retryHeaders.set("Authorization", `Bearer ${accessToken}`);

            return fetch(url, {
              ...init,
              headers: retryHeaders,
            });
          }
        }
        // リフレッシュ失敗時は元の401レスポンスを返す
      }

      return response;
    },
  });
};
