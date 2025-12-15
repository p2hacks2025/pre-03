# @packages/env CLAUDE.md

環境変数の Zod スキーマ定義を提供する共通パッケージ。モノレポ内で最も基盤となるパッケージであり、他の全パッケージから参照される。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| バリデーション | Zod 4 |
| エクスポート形式 | TypeScript ソースを直接エクスポート（ビルド不要） |

---

## アーキテクチャ全体像

### パッケージの立ち位置

```
@packages/env   ← 最下層パッケージ（他の @packages/* に依存しない）
    ↑
    ├── @packages/db（dbKeys を参照）
    ├── apps/api（apiKeys を参照）
    ├── apps/web（webClientKeys, webServerKeys を参照）
    └── apps/native（nativeClientKeys を参照）
```

**設計原則**:

1. **循環依存の防止**: 他の `@packages/*` に依存しない
2. **用途ごとの分離**: API / DB / Web / Native でスキーマを分離
3. **継承パターン**: `apiKeys` は `dbKeys` をスプレッド演算子で継承

---

## プロジェクト構造

```
src/
├── index.ts        # 統合エクスポート
├── api-keys.ts     # API サーバー用スキーマ（dbKeys を継承）
├── db-keys.ts      # データベース接続用スキーマ
├── web-keys.ts     # Web フロントエンド用スキーマ（Server / Client）
└── native-keys.ts  # React Native アプリ用スキーマ
```

---

## 各ファイルの役割

### api-keys.ts（API サーバー用）

`dbKeys` を継承し、Supabase 関連の環境変数を追加。

| 変数名 | 型 | 必須 | 説明 |
|--------|------|:----:|------|
| `DATABASE_URL` | URL | Yes | PostgreSQL 接続文字列（dbKeys から継承） |
| `SUPABASE_URL` | URL | Yes | Supabase プロジェクト URL |
| `SUPABASE_ANON_KEY` | string | Yes | Supabase 匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | string | No | Supabase サービスロールキー |
| `ALLOWED_ORIGINS` | string | No | 許可する Origin（カンマ区切り） |
| `ENVIRONMENT` | enum | No | `development` / `staging` / `production` |
| `LOG_LEVEL` | enum | No | `debug` / `info` / `warn` / `error` / `fatal` |

### db-keys.ts（データベース用）

マイグレーション実行時など、DB 接続のみが必要な場面で使用。

| 変数名 | 型 | 必須 | 説明 |
|--------|------|:----:|------|
| `DATABASE_URL` | URL | Yes | PostgreSQL 接続文字列 |

### web-keys.ts（Web フロントエンド用）

**webServerKeys**（サーバー側）:

| 変数名 | 型 | 必須 | 説明 |
|--------|------|:----:|------|
| `ENVIRONMENT` | enum | No | `development` / `staging` / `production` |
| `LOG_LEVEL` | enum | No | `debug` / `info` / `warn` / `error` / `fatal` |

**webClientKeys**（クライアント側）:

| 変数名 | 型 | 必須 | 説明 |
|--------|------|:----:|------|
| `NEXT_PUBLIC_API_BASE_URL` | URL | Yes | API エンドポイント URL |

> **Note**: `NEXT_PUBLIC_` プレフィックスは Next.js でクライアント側に公開される環境変数を示す。

### native-keys.ts（React Native 用）

| 変数名 | 型 | 必須 | 説明 |
|--------|------|:----:|------|
| `API_BASE_URL` | URL | Yes | API エンドポイント URL |
| `API_REMOTE_URL` | URL | No | リモート API URL（開発用） |
| `ENVIRONMENT` | enum | No | `development` / `staging` / `production` / `native` |
| `LOG_LEVEL` | enum | No | `debug` / `info` / `warn` / `error` / `fatal` |

---

## エクスポート一覧

```typescript
// スキーマオブジェクト
export { apiKeys } from "./api-keys";
export { dbKeys } from "./db-keys";
export { webClientKeys, webServerKeys } from "./web-keys";
export { nativeClientKeys } from "./native-keys";

// 型定義
export type { ApiKeys } from "./api-keys";
export type { DbKeys } from "./db-keys";
export type { WebClientKeys, WebServerKeys } from "./web-keys";
export type { NativeClientKeys } from "./native-keys";
```

---

## 使用例

### apps/api での使用

```typescript
import { apiKeys } from "@packages/env";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: apiKeys,
  runtimeEnv: {
    DATABASE_URL: bindings.DATABASE_URL,
    SUPABASE_URL: bindings.SUPABASE_URL,
    SUPABASE_ANON_KEY: bindings.SUPABASE_ANON_KEY,
    // ...
  },
  emptyStringAsUndefined: true,
});
```

### apps/web での使用

```typescript
import { webClientKeys, webServerKeys } from "@packages/env";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: webServerKeys,
  clientPrefix: "NEXT_PUBLIC_",
  client: webClientKeys,
  runtimeEnv: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    ENVIRONMENT: process.env.ENVIRONMENT,
    LOG_LEVEL: process.env.LOG_LEVEL,
  },
  emptyStringAsUndefined: true,
});
```

### apps/native での使用

```typescript
import { nativeClientKeys } from "@packages/env";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  client: nativeClientKeys,
  clientPrefix: "",
  runtimeEnv: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    // ...
  },
  emptyStringAsUndefined: true,
});
```

### @packages/db での使用

```typescript
import { dbKeys } from "@packages/env";
import { createEnv } from "@t3-oss/env-core";

const env = createEnv({
  server: dbKeys,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
```

---

## 新しい環境変数の追加方法

### Step 1: 対象ファイルを選択

| 用途 | ファイル |
|------|---------|
| API サーバー専用 | `api-keys.ts` |
| データベース接続 | `db-keys.ts` |
| Web フロントエンド（サーバー側） | `web-keys.ts` → `webServerKeys` |
| Web フロントエンド（クライアント側） | `web-keys.ts` → `webClientKeys` |
| React Native アプリ | `native-keys.ts` |

### Step 2: スキーマを追加

```typescript
// 例: api-keys.ts に新しい変数を追加
export const apiKeys = {
  ...dbKeys,
  // 既存の定義...
  NEW_VARIABLE: z.string().min(1),           // 必須文字列
  OPTIONAL_VAR: z.string().optional(),       // オプショナル
  ENUM_VAR: z.enum(["a", "b", "c"]),         // 列挙型
  URL_VAR: z.url(),                          // URL 型
};
```

### Step 3: 使用箇所で参照

```typescript
import { apiKeys } from "@packages/env";

const env = createEnv({
  server: apiKeys,
  runtimeEnv: {
    // 新しい変数を追加
    NEW_VARIABLE: process.env.NEW_VARIABLE,
  },
});
```

---

## 開発コマンド

| コマンド | 説明 |
|----------|------|
| `pnpm check` | Biome によるコード品質チェック |
| `pnpm check:fix` | Biome による自動修正 |
| `pnpm typecheck` | TypeScript 型チェック |

---

## 参考リンク

- [Zod 公式ドキュメント](https://zod.dev/)
- [@t3-oss/env-core](https://env.t3.gg/)
