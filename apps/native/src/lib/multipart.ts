/**
 * React Native 用 multipart/form-data 送信ヘルパー
 * Bearer トークン認証を使用
 */

import { tokenManager } from "@/features/auth/lib/token-manager";

type MultipartEndpoint = {
  $url: () => URL;
};

/**
 * multipart/form-data でファイルをアップロード（401自動リトライ付き）
 *
 * @example
 * ```typescript
 * const authClient = getAuthenticatedClient();
 * const result = await postMultipartWithRetry<CreateEntryOutput>(
 *   authClient.entries,
 *   formData,
 *   getAccessToken,
 *   refreshToken,
 * );
 * ```
 */
export const postMultipartWithRetry = async <TOutput>(
  endpoint: MultipartEndpoint,
  formData: FormData,
  getAccessToken: () => Promise<string | null>,
  refreshToken: () => Promise<boolean>,
): Promise<TOutput> => {
  const url = endpoint.$url();

  const isExpiringSoon = await tokenManager.isTokenExpiringSoon();
  if (isExpiringSoon) {
    await refreshToken();
  }

  let accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("認証が必要です");
  }

  const doRequest = async (token: string): Promise<Response> => {
    return fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type は FormData から自動設定されるので指定しない
      },
      body: formData,
    });
  };

  let response = await doRequest(accessToken);

  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      accessToken = await getAccessToken();
      if (accessToken) {
        response = await doRequest(accessToken);
      }
    }
  }

  if (!response.ok) {
    const data = (await response.json()) as { error?: { message?: string } };
    throw new Error(data.error?.message || "アップロードに失敗しました");
  }

  return response.json() as Promise<TOutput>;
};
