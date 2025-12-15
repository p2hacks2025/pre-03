# @packages/api-contract CLAUDE.md

Hono RPC クライアント生成パッケージ。`apps/api` の型定義から型安全な API クライアントを提供。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| RPC クライアント | Hono RPC (`hono/client`) |
| 型定義参照 | `@repo/api/contract` |
| 認証方式 | HttpOnly Cookie（`credentials: 'include'`） |

---

## パッケージの役割

### 依存の集約

`hono/client` への依存をこのパッケージに集約し、フロントエンドから `hono` パッケージへの直接依存を排除。

```
apps/web
    ↓ createClient を使用
@packages/api-contract
    ↓ AppType 型を参照
apps/api
```

### 提供する機能

| エクスポート | 説明 |
|-------------|------|
| `createClient` | Hono RPC クライアント生成関数 |
| `ApiClient` | クライアントの型定義 |
| `AppType` | API ルート全体の型 |
| `postMultipart` | ファイルアップロードヘルパー |

---

## プロジェクト構造

```
src/
├── index.ts      # 統合エクスポート
├── client.ts     # createClient 関数
├── multipart.ts  # multipart/form-data ヘルパー
└── types.ts      # AppType 再エクスポート
```

---

## 主要ファイルの役割

### src/client.ts

API クライアント生成関数を提供。

```typescript
import { hc } from "hono/client";
import type { AppType } from "./types";

export type ApiClient = ReturnType<typeof hc<AppType>>;

export const createClient = (
  baseUrl: string,
  options?: {
    credentials?: RequestCredentials;
    fetch?: typeof fetch;
  },
): ApiClient =>
  hc<AppType>(baseUrl, {
    fetch: options?.fetch
      ? options.fetch
      : options?.credentials
        ? (url, init) => fetch(url, { ...init, credentials: options.credentials })
        : undefined,
  });
```

**オプション**:

| オプション | 型 | 説明 |
|-----------|------|------|
| `credentials` | `RequestCredentials` | Cookie 送信設定（`'include'` で HttpOnly Cookie 送信） |
| `fetch` | `typeof fetch` | カスタム fetch 関数（Server Components 用） |

### src/multipart.ts

Hono RPC は `multipart/form-data` 未対応のため、ファイルアップロード用ヘルパーを提供。

```typescript
export const postMultipart = async <TOutput>(
  endpoint: MultipartEndpoint,
  formData: FormData,
): Promise<TOutput>
```

**特徴**:
- Hono RPC の `$url()` で URL を取得
- `credentials: "include"` で Cookie 自動送信
- 引数にアクセストークン不要（Cookie 認証）

### src/types.ts

API の型定義を再エクスポート。

```typescript
export type { AppType } from "@repo/api/contract";
```

---

## 型推論フロー

```
[1] API ルート定義
    apps/api/src/routes/index.ts → export const routes = ...

[2] 型エクスポート
    apps/api/src/contract.ts → export type AppType = typeof routes

[3] 型定義ビルド（pnpm api build:types）
    → apps/api/types/contract.d.ts 生成

[4] 本パッケージで参照
    src/types.ts → export type { AppType } from "@repo/api/contract"

[5] クライアント生成
    src/client.ts → hc<AppType>(baseUrl)

[6] フロントエンドで使用
    apps/web/src/lib/api.ts → createClient(baseUrl)
```

---

## 使用例

### 基本的なクライアント生成

```typescript
// apps/web/src/lib/api.ts
import { createClient } from "@packages/api-contract";
import { env } from "@/env";

// 認証不要エンドポイント用（Cookie なし）
export const publicClient = createClient(env.NEXT_PUBLIC_API_BASE_URL);

// 認証必要エンドポイント用（HttpOnly Cookie 自動送信）
export const client = createClient(env.NEXT_PUBLIC_API_BASE_URL, {
  credentials: "include",
});
```

### API 呼び出し

```typescript
// GET リクエスト
const res = await client.health.$get();
const data = await res.json();

// POST リクエスト
const res = await client.auth.login.$post({
  json: { email, password },
});
```

### ファイルアップロード

```typescript
import { postMultipart } from "@packages/api-contract";
import { client } from "@/lib/api";
import type { UploadAvatarOutput } from "@packages/schema/user";

const formData = new FormData();
formData.append("file", file);

const result = await postMultipart<UploadAvatarOutput>(
  client.user.avatar,
  formData,
);
```

### Server Components 用カスタム fetch

```typescript
// apps/web/src/lib/api-server.ts
import { createClient } from "@packages/api-contract";
import { cookies } from "next/headers";

export const createServerClient = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  return createClient(env.NEXT_PUBLIC_API_BASE_URL, {
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
        },
      }),
  });
};
```

---

## 開発コマンド

> **Note**: monorepo 構成のため、ルート（`/`）から実行。

| コマンド | 説明 |
|----------|------|
| `pnpm typecheck` | 型チェック |
| `pnpm check` | Biome チェック |
| `pnpm check:fix` | Biome 自動修正 |

---

## 設計思想

### なぜ別パッケージとして分離するか

1. **依存の集約**: `hono/client` への依存をこのパッケージに集約し、`apps/web` のバンドルサイズを最適化
2. **クライアント生成ロジックの統一**: 複数のフロントエンド（Web、Native）で同じクライアント生成関数を使用可能
3. **関心の分離**: API は型エクスポート、本パッケージはクライアント生成、フロントエンドはクライアント使用

### HttpOnly Cookie 認証

- セキュリティ上、`localStorage` でのトークン管理を避け HttpOnly Cookie を採用
- `credentials: "include"` で Cookie を自動送信
- Server Components では Cookie を手動でヘッダーに付与

---

## 参考リンク

- [Hono RPC](https://hono.dev/docs/guides/rpc)
- [Hono Client](https://hono.dev/docs/guides/rpc#client)
