import { createClient } from "@packages/api-contract";
import { cookies } from "next/headers";

import { env } from "@/env";

/**
 * Server Components / Server Actions 用の API クライアントを生成
 *
 * Next.js の cookies() を使用して HttpOnly Cookie からトークンを取得し、
 * Authorization ヘッダーとして API に送信する
 *
 * @example
 * ```typescript
 * // Server Component での使用例
 * const client = await createServerClient();
 * const res = await client.user.me.$get();
 * ```
 */
export const createServerClient = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  return createClient(env.NEXT_PUBLIC_API_BASE_URL, {
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      }),
  });
};
