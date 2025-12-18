# apps/api CLAUDE.md

Hono + @hono/zod-openapi による OpenAPI 準拠の API サーバー。Cloudflare Workers 上で動作。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Hono 4 + @hono/zod-openapi |
| データベース | Drizzle ORM（PostgreSQL via Hyperdrive） |
| 認証 | Supabase Auth |
| ストレージ | Supabase Storage |
| バリデーション | Zod |
| 環境変数 | @t3-oss/env-core |
| ロギング | @packages/logger |
| デプロイ | Cloudflare Workers |

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [README.md](./README.md) | ディレクトリ構造と触る頻度の目安 |
| [RECIPES.md](./RECIPES.md) | 具体的なコード例付きの実装パターン集 |

---

## アーキテクチャ全体像

### 軽量クリーンアーキテクチャ

Cloudflare Workers のコールドスタート対策として、**DI コンテナを使わない軽量なクリーンアーキテクチャ**を採用。

**設計原則**:

1. **関数ベースの依存性注入**: DI コンテナではなく、関数引数で依存を渡す
2. **レイヤー分離**: routes → usecase → repository の単方向依存
3. **自明なファイル配置**: 「どこに何があるか」が明確

**依存の方向**:

```
routes/（プレゼンテーション層）
    ↓ 呼び出し
usecase/（アプリケーション層）
    ↓ 呼び出し
repository/（データアクセス層）
    ↓ 使用
infrastructure/（外部サービス）
```

---

## プロジェクト構造

```
src/
├── app.ts                # エントリーポイント（ルーター・ミドルウェア登録）
├── contract.ts           # RPC 型エクスポート（フロントエンド向け）
├── context.ts            # Hono Context 型定義 + AppRouteHandler
│
├── config/               # 設定・ファクトリー
│   ├── env.ts            # 環境変数パース
│   └── router.ts         # OpenAPIHono ファクトリー
│
├── routes/               # プレゼンテーション層
│   ├── index.ts          # ルート集約・マウント
│   ├── root.ts           # ルートエンドポイント
│   └── {feature}/        # 機能別ディレクトリ（health/, auth/, user/）
│       ├── index.ts      # ルーター組み立て
│       ├── route.ts      # OpenAPI ルート定義
│       └── handlers.ts   # ハンドラー実装
│
├── usecase/              # アプリケーション層（ビジネスロジック）
│   └── {feature}/        # 機能別ディレクトリ（auth/, user/）
│       ├── index.ts      # 集約エクスポート
│       └── {action}.ts   # 個別ユースケース
│
├── repository/           # データアクセス層（DB 操作）
│   └── {entity}.ts       # エンティティ別（profile.ts）
│
├── infrastructure/       # 外部サービス連携
│   ├── db.ts             # Drizzle ORM クライアント
│   └── supabase.ts       # Supabase クライアント
│
├── middleware/           # Hono ミドルウェア
│   ├── auth.ts           # 認証（JWT 検証）
│   ├── cors.ts           # CORS 設定
│   ├── db.ts             # DB クライアント注入
│   ├── env.ts            # 環境変数注入
│   └── logger.ts         # ロガー注入
│
└── shared/               # 共有ユーティリティ
    ├── cookie.ts         # Cookie 操作
    └── error/            # エラーハンドリング
        ├── app-error.ts      # カスタム HTTPException
        ├── error-handler.ts  # グローバルエラーハンドラー
        ├── error-openapi.ts  # OpenAPI エラースキーマ
        └── zod-error.ts      # Zod エラー変換
```

---

## 共通パッケージとの関係

### パッケージ一覧

| パッケージ | 役割 |
|-----------|------|
| `@packages/schema` | API 入出力スキーマ（Zod + OpenAPI） |
| `@packages/db` | Drizzle ORM スキーマ・マイグレーション |
| `@packages/env` | 環境変数の型定義・バリデーション |
| `@packages/logger` | ロギングユーティリティ |
| `@packages/api-contract` | Hono RPC 型安全クライアント |

### 型共有フロー

```
[1] API ルート定義
    routes/index.ts → export const routes = ...

[2] 型エクスポート
    contract.ts → export type AppType = typeof routes

[3] 型定義ビルド（pnpm api build:types）
    → types/contract.d.ts 生成

[4] api-contract パッケージで参照
    @packages/api-contract → createClient 関数を提供

[5] フロントエンドで使用
    apps/web → import { createClient } from "@packages/api-contract"
```

---

## 各レイヤーの役割

### routes/（プレゼンテーション層）

HTTP リクエスト/レスポンスの処理と OpenAPI 仕様の定義。

| ファイル | 役割 |
|---------|------|
| `route.ts` | `createRoute()` でルート定義（スキーマ、ミドルウェア指定） |
| `handlers.ts` | `AppRouteHandler<R>` 型でハンドラー実装 |
| `index.ts` | `.openapi(route, handler)` でルーター組み立て |

→ 実装例は [RECIPES.md](./RECIPES.md#apiエンドポイントの追加) を参照

### usecase/（アプリケーション層）

ビジネスロジックを担当。純粋関数として実装し、シグネチャは `(deps, input) => Promise<Output>`。

→ 型共有パターンは [RECIPES.md](./RECIPES.md#usecase-の型共有パターン) を参照

### repository/（データアクセス層）

DB 操作を抽象化。Drizzle ORM を使用。

→ 実装例は [RECIPES.md](./RECIPES.md#step-3-repository追加必要な場合) を参照

### middleware/

| ミドルウェア | 適用方法 | 説明 |
|-------------|---------|------|
| `envMiddleware` | グローバル | 環境変数パース・注入 |
| `loggerMiddleware` | グローバル | リクエストログ・ロガー注入 |
| `corsMiddleware` | グローバル | CORS 設定 |
| `authMiddleware` | ルート固有 | JWT 検証、`c.set("user", ...)` |
| `dbMiddleware` | ルート固有 | DB クライアント注入 |

→ 追加方法は [RECIPES.md](./RECIPES.md#middlewareの追加) を参照

### shared/error/

エラーハンドリングを一元管理。`AppError` を throw するとレスポンスに変換される。

| コード | HTTP ステータス |
|--------|----------------|
| `BAD_REQUEST` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `INTERNAL_SERVER_ERROR` | 500 |

---

## タイムゾーンの扱い（重要）

### 基本方針

**DB は UTC 基準で保存されているため、API 側での日付操作もすべて UTC ベースで行う。**

### よくある間違いと正しい書き方

#### 1. Date オブジェクトの作成

```typescript
// ❌ 間違い: ローカルタイムで作成
const date = new Date(2025, 11, 1); // JST 2025-12-01 00:00 = UTC 2025-11-30 15:00

// ✅ 正しい: UTC で作成
const date = new Date(Date.UTC(2025, 11, 1)); // UTC 2025-12-01 00:00
```

#### 2. Date オブジェクトからの値取得

```typescript
// ❌ 間違い: ローカルタイムのメソッド
date.getFullYear();  // ローカルタイムの年
date.getMonth();     // ローカルタイムの月
date.getDate();      // ローカルタイムの日
date.getDay();       // ローカルタイムの曜日

// ✅ 正しい: UTC メソッド
date.getUTCFullYear();  // UTC の年
date.getUTCMonth();     // UTC の月
date.getUTCDate();      // UTC の日
date.getUTCDay();       // UTC の曜日
```

#### 3. Date オブジェクトの変更

```typescript
// ❌ 間違い: ローカルタイムで変更
date.setDate(date.getDate() + 7);

// ✅ 正しい: UTC で変更
date.setUTCDate(date.getUTCDate() + 7);
```

### 日付を YYYY-MM-DD 形式に変換

```typescript
/**
 * UTC ベースで日付を YYYY-MM-DD 形式に変換
 * PostgreSQL の DATE 型が文字列で返される場合にも対応
 */
const formatDateToISODate = (date: Date | string): string => {
  if (typeof date === "string") {
    // すでに YYYY-MM-DD 形式の場合はそのまま返す
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // ISO 形式の場合は日付部分のみ抽出
    return date.split("T")[0];
  }
  // UTC メソッドを使用してタイムゾーンズレ防止
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
```

### Repository での日付範囲クエリ

```typescript
// ✅ 正しい: UTC で範囲を作成
export const getEntryDatesByMonth = async (
  db: DbClient,
  options: { profileId: string; year: number; month: number },
): Promise<EntryDateResult[]> => {
  const { profileId, year, month } = options;

  // UTC で日付範囲を作成（タイムゾーンズレ防止）
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1)); // 翌月1日

  return db.select()
    .from(userPosts)
    .where(
      and(
        eq(userPosts.userProfileId, profileId),
        gte(userPosts.createdAt, monthStart),
        lt(userPosts.createdAt, monthEnd),
      ),
    );
};
```

### Usecase での週計算

```typescript
// ✅ 正しい: UTC ベースで週の計算
const getWeekStartDatesForMonth = (year: number, month: number): Date[] => {
  // UTC で日付を作成
  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));

  const firstMonday = new Date(firstDayOfMonth);
  const firstDayOfWeek = firstMonday.getUTCDay(); // UTC の曜日
  if (firstDayOfWeek !== 1) {
    const daysUntilMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek;
    firstMonday.setUTCDate(firstMonday.getUTCDate() + daysUntilMonday);
  }

  const weekStarts: Date[] = [];
  const current = new Date(firstMonday);
  while (current.getUTCMonth() === month - 1) { // UTC の月で比較
    weekStarts.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 7);
  }
  return weekStarts;
};
```

### チェックリスト

新しく日付を扱うコードを書く際は、以下を確認：

- [ ] `new Date(year, month, day)` → `new Date(Date.UTC(year, month, day))`
- [ ] `getFullYear()` → `getUTCFullYear()`
- [ ] `getMonth()` → `getUTCMonth()`
- [ ] `getDate()` → `getUTCDate()`
- [ ] `getDay()` → `getUTCDay()`
- [ ] `setDate()` → `setUTCDate()`
- [ ] `setMonth()` → `setUTCMonth()`
- [ ] PostgreSQL DATE 型が文字列で返される可能性を考慮

### 参考実装

| ファイル | 内容 |
|---------|------|
| `usecase/reflection/get-calendar.ts` | UTC ベースの週計算・日付フォーマット |
| `repository/user-post.ts` | UTC ベースの日付範囲クエリ |

---

## 参考にするべきファイル

### 新規 API エンドポイント追加時

| 参考ファイル | 内容 |
|-------------|------|
| `routes/user/route.ts` | ルート定義の例 |
| `routes/user/handlers.ts` | ハンドラー実装の例 |
| `routes/user/index.ts` | ルーター組み立ての例 |
| `usecase/user/get-me.ts` | 認証ユーザーを扱うユースケースの例 |
| `usecase/user/upload-avatar.ts` | ファイルアップロード処理の例 |
| `repository/profile.ts` | リポジトリ関数の例（CRUD 操作） |

### パターン別参考ファイル

| パターン | 参考ファイル |
|---------|-------------|
| 認証が必要な API | `routes/user/route.ts`（`authMiddleware` 使用） |
| DB 操作を伴う API | `routes/health/route.ts`（`dbMiddleware` 使用） |
| ファイルアップロード | `routes/user/handlers.ts`（`uploadAvatarHandler`） |
| Supabase Storage 操作 | `usecase/user/upload-avatar.ts` |
| Cookie 操作 | `routes/auth/handlers.ts` + `shared/cookie.ts` |

---

## 開発コマンド

> **Note**: monorepo 構成のため、実行するディレクトリに注意。
> ルート（`/`）から実行する場合は `pnpm api <command>` を使用。
> `apps/api/` ディレクトリ内から実行する場合は `pnpm <command>` を使用。

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー起動（localhost:4001） |
| `pnpm dev:types` | 型定義 Watch & 自動再生成 |
| `pnpm build` | 本番ビルド |
| `pnpm build:types` | 型定義生成（一回限り） |
| `pnpm deploy` | Cloudflare Workers にデプロイ |
| `pnpm typecheck` | 型チェック |
| `pnpm check` | Biome チェック |
| `pnpm check:fix` | Biome 自動修正 |

---

## 環境変数

### Bindings（wrangler.json / Cloudflare Secrets）

| 変数名 | 説明 |
|--------|------|
| `HYPERDRIVE` | Hyperdrive バインディング |
| `DATABASE_URL` | PostgreSQL 接続文字列 |
| `SUPABASE_URL` | Supabase プロジェクト URL |
| `SUPABASE_ANON_KEY` | Supabase 匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー（Storage 操作用） |
| `ALLOWED_ORIGINS` | 許可する Origin（カンマ区切り、ワイルドカード対応） |
| `LOG_LEVEL` | ログレベル（オプション） |
| `ENVIRONMENT` | 環境識別子（オプション） |

### 開発環境

環境変数は `.env` ファイルで設定（git 無視）。

> **Note**: `.env` ファイルはセキュリティ上の理由から Claude Code では読み取れません。
> 環境変数の内容を確認する場合は `.env.example` を参照してください。

---

## OpenAPI / Swagger UI

- Swagger UI: http://localhost:4001/docs
- OpenAPI JSON: http://localhost:4001/openapi

---

## 参考リンク

- [Hono 公式ドキュメント](https://hono.dev/)
- [@hono/zod-openapi](https://hono.dev/docs/guides/zod-openapi)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
