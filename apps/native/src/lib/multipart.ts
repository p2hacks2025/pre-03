/**
 * React Native 用 multipart/form-data 送信ヘルパー
 * Bearer トークン認証を使用
 */

type MultipartEndpoint = {
  $url: () => URL;
};

/**
 * multipart/form-data でファイルをアップロード（Bearer トークン認証）
 *
 * @example
 * ```typescript
 * const authClient = createAuthenticatedClient(accessToken);
 * const result = await postMultipartWithAuth<CreateEntryOutput>(
 *   authClient.entries,
 *   formData,
 *   accessToken,
 * );
 * ```
 */
export const postMultipartWithAuth = async <TOutput>(
  endpoint: MultipartEndpoint,
  formData: FormData,
  accessToken: string,
): Promise<TOutput> => {
  const url = endpoint.$url();

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // Content-Type は FormData から自動設定されるので指定しない
    },
    body: formData,
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: { message?: string } };
    throw new Error(data.error?.message || "アップロードに失敗しました");
  }

  return response.json() as Promise<TOutput>;
};
