import { createClient } from "@packages/api-contract";

import { env } from "@/env";

/**
 * 認証不要エンドポイント用クライアント
 * ヘルスチェックなど Cookie を送信する必要がない場合に使用
 */
export const publicClient = createClient(env.NEXT_PUBLIC_API_BASE_URL);

/**
 * Cookie 認証用クライアント
 * credentials: 'include' で HttpOnly Cookie を自動送信
 */
export const client = createClient(env.NEXT_PUBLIC_API_BASE_URL, {
  credentials: "include",
});
