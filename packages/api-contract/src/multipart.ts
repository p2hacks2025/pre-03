/**
 * multipart/form-data でファイルをアップロードするためのユーティリティ
 * Hono RPC は multipart 未対応のため、$url() で URL を取得し fetch で送信
 */

type MultipartEndpoint = {
  $url: () => URL;
};

/**
 * multipart/form-data でファイルをアップロード
 * Cookie 認証を使用（credentials: 'include'）
 *
 * @example
 * ```typescript
 * const result = await postMultipart<UploadAvatarOutput>(
 *   client.user.avatar,
 *   formData,
 * );
 * ```
 */
export const postMultipart = async <TOutput>(
  endpoint: MultipartEndpoint,
  formData: FormData,
): Promise<TOutput> => {
  const url = endpoint.$url();

  const response = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: { message?: string } };
    throw new Error(data.error?.message || "アップロードに失敗しました");
  }

  return response.json() as Promise<TOutput>;
};
