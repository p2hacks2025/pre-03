# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 15 + React Native + Hono のフルスタックモノレポテンプレート。Turborepo + pnpm ワークスペースで管理し、Cloudflare Workers/Pages（Web/API）と Expo（Mobile）にデプロイする構成。

## ディレクトリ構成

```
apps/
├── api/       # Hono 4 API (Cloudflare Workers) - localhost:4001
├── web/       # Next.js 15 App Router (Cloudflare Pages) - localhost:4000
├── native/    # React Native 0.81 + Expo 54 - localhost:4002
└── worker/    # Node.js バッチ処理・定期実行ワーカー
packages/
├── api-contract/  # Hono RPC クライアント生成
├── db/            # Drizzle ORM スキーマ・マイグレーション
├── env/           # 環境変数定義 (Zod) - 最下層パッケージ
├── logger/        # 構造化ロギング（ゼロ依存）
└── schema/        # API共有スキーマ (Zod + @hono/zod-openapi)
```

## 開発コマンド

```bash
# 開発
pnpm dev              # 全アプリ起動 (API:4001 + Web:4000 + Native:4002)
pnpm api dev          # APIのみ（localhost:4001）
pnpm web dev          # Webのみ（localhost:4000）
pnpm native dev       # Nativeのみ（localhost:4002）

# ビルド・品質
pnpm build            # 全アプリビルド
pnpm check            # Biomeチェック
pnpm check:fix        # 自動修正
pnpm typecheck        # 型チェック

# データベース
pnpm db:generate      # マイグレーション生成
pnpm db:migrate       # マイグレーション適用
pnpm db:push          # スキーマを直接DBにプッシュ（開発用）
pnpm db:studio        # Drizzle Studio起動
pnpm db:seed          # シード実行
pnpm db:setup         # Supabase起動 + migrate + seed

# セットアップ
pnpm workspace:setup  # 依存関係インストール + 初期設定

# 個別プロジェクト
pnpm api <command>    # APIで実行
pnpm web <command>    # Webで実行
pnpm native <command> # Nativeで実行

# Worker（バッチ処理）
pnpm worker job <job-name>  # ジョブを単発実行
pnpm worker daemon          # デーモンモードで起動
```

## アーキテクチャ

### Hono RPC統合

フロントエンド（Web/Native）とバックエンド間で型安全な通信を実現：

1. `apps/api/src/app.ts` でルートを定義
2. `apps/api/src/contract.ts` で `AppType` をエクスポート
3. `pnpm dev` 実行時に自動で型定義を生成・更新
4. `@packages/api-contract` が型安全なクライアント生成関数を提供
5. `apps/web/src/lib/api.ts` / `apps/native/src/lib/api.ts` で `createClient` を使用

```typescript
// apps/web での使用例
import { client } from "@/lib/api";
const res = await client.health.$get();

// apps/native での使用例
import { client, createAuthenticatedClient } from "@/lib/api";
const res = await client.health.$get();
const authClient = createAuthenticatedClient(accessToken);
```

### OpenAPI統合

- @hono/zod-openapi で Zod スキーマから自動生成
- `/docs` で Swagger UI を提供
- `/openapi` で OpenAPI JSON を公開

## 主要技術

| 層 | 技術 |
|----|------|
| Web フロントエンド | Next.js 15, React 19, Tailwind CSS 4, shadcn/ui |
| モバイル | React Native 0.81, Expo 54, HeroUI Native, Uniwind |
| バックエンド | Hono 4, Drizzle ORM, Supabase |
| インフラ | Cloudflare Workers/Pages, Hyperdrive |
| ツール | Turborepo, Biome, Lefthook |
| バリデーション | Zod, @t3-oss/env-core |
| ロギング | @packages/logger（構造化ログ） |

## パスエイリアス

全アプリ（api, web, native）で `@/*` が `./src/*` にマッピング。

---

## モノレポ構成と依存関係

### パッケージ依存関係図

```
apps/web (@repo/web)
├─── @packages/api-contract ────┐
├─── @packages/env ─────────────┤
├─── @packages/logger ──────────┤ ワークスペース依存
└─── @packages/schema ──────────┘

apps/api (@repo/api)
├─── @packages/db ──────────────┐
├─── @packages/env ─────────────┤
├─── @packages/logger ──────────┤ ワークスペース依存
└─── @packages/schema ──────────┘

apps/native (@repo/native)
├─── @packages/api-contract ────┐
├─── @packages/env ─────────────┤
├─── @packages/logger ──────────┤ ワークスペース依存
└─── @packages/schema ──────────┘

apps/worker (@repo/worker)
├─── @packages/db ──────────────┐
├─── @packages/env ─────────────┤ ワークスペース依存
└─── @packages/logger ──────────┘

@packages/api-contract
├─── @repo/api ─────────────────  AppType 型を参照
└─── hono ──────────────────────  Hono RPC クライアント

@packages/db
└─── @packages/env ───────────── 環境変数定義を参照

@packages/env
└─── (外部依存のみ: zod)

@packages/logger
└─── (外部依存なし: ゼロ依存)

@packages/schema
└─── (外部依存のみ: @hono/zod-openapi, zod)
```

### パッケージの役割

| パッケージ | 役割 | 主な提供機能 |
|-----------|------|-------------|
| `@packages/api-contract` | API クライアント | `createClient`, `ApiClient`, `AppType`, `postMultipart` |
| `@packages/env` | 環境変数定義 | `apiKeys`, `dbKeys`, `webClientKeys`, `nativeClientKeys` |
| `@packages/schema` | API スキーマ | Zod + OpenAPI スキーマ定義 |
| `@packages/db` | データベース | Drizzle ORM クライアント、スキーマ、シード機能 |
| `@packages/logger` | ロギング | `createLogger`（開発: 色付きテキスト / 本番: JSON） |

### 型推論フロー（RPC 統合）

```
[1] API ルート定義
    apps/api/src/app.ts → export { routes }

[2] 型エクスポート
    apps/api/src/contract.ts → export type AppType = typeof routes

[3] 型定義ビルド（pnpm dev 時に自動実行）
    tsc -p tsconfig.types.json → apps/api/types/contract.d.ts

[4] package.json exports
    "@repo/api/contract" → "./types/contract.d.ts"

[5] api-contract パッケージで参照
    @packages/api-contract/src/types.ts → export type { AppType }
    @packages/api-contract/src/client.ts → createClient 関数を提供

[6] フロントエンドで使用
    apps/web/src/lib/api.ts → import { createClient } from "@packages/api-contract"
    apps/native/src/lib/api.ts → 同様に createClient を使用
    → createClient(baseUrl) で型安全なクライアント生成
```

---

## 開発フロー

### pnpm dev 実行時の流れ

```
$ pnpm dev
  │
  └─ turbo run dev dev:types db:studio（Turborepo が並行実行）
     │
     ├─ apps/api
     │  ├─ dev: wrangler dev → localhost:4001
     │  └─ dev:types: tsc --watch → types/ 生成 & 監視
     │
     ├─ apps/web
     │  └─ dev: next dev --turbopack → localhost:4000
     │
     ├─ apps/native
     │  └─ dev: expo start --port 4002 → localhost:4002
     │
     └─ @packages/db
        └─ db:studio: drizzle-kit studio
```

**ポイント**:
- `dev`, `dev:types`, `db:studio` は persistent タスク（終了しない）
- API コード変更時に自動で型定義が再生成
- Web/Native 側のエディタで即座に型が更新される

### ビルド時の依存関係解決

```
$ pnpm build
  │
  ├─ 1st pass: @packages/* のビルド
  │  └─ 依存関係なし → 並行実行
  │
  └─ 2nd pass: apps/* のビルド
     ├─ apps/api: dependsOn ["^build"]
     ├─ apps/web: dependsOn ["^build", "^build:types"]
     └─ apps/native: dependsOn ["^build", "^build:types"]
```

---

## Turborepo タスク依存関係

### 主要タスク一覧

| タスク | キャッシュ | 依存関係 | 説明 |
|--------|----------|---------|------|
| `dev` | - | なし | 開発サーバー起動（persistent） |
| `dev:types` | - | なし | 型定義 Watch（persistent） |
| `db:studio` | - | なし | Drizzle Studio起動（persistent） |
| `build` | ✓ | `^build` | 本番ビルド |
| `build:types` | ✓ | なし | 型定義生成（キャッシュ有効） |
| `build:worker` | ✓ | `build` | Cloudflare 用ビルド |
| `typecheck` | ✓ | なし | 型チェック |
| `check` | ✓ | なし | Biome チェック |

### キャッシュ戦略

```json
// turbo.json
{
  "build:types": {
    "cache": true,
    "outputs": ["types/**/*.d.ts"],
    "inputs": ["src/**/*.ts", "tsconfig.*.json"]
  }
}
```

- 入力ファイルのハッシュでキャッシュキーを生成
- 変更がなければキャッシュから復元（高速）

---

## 詳細ドキュメント

### アプリケーション

| プロジェクト | ドキュメント | 概要 |
|-------------|-------------|------|
| API | [apps/api/CLAUDE.md](./apps/api/CLAUDE.md) | Hono + OpenAPI 実装ガイド |
| Web | [apps/web/CLAUDE.md](./apps/web/CLAUDE.md) | Next.js + shadcn/ui 実装ガイド |
| Native | [apps/native/CLAUDE.md](./apps/native/CLAUDE.md) | Expo + HeroUI Native 実装ガイド |
| Worker | [apps/worker/CLAUDE.md](./apps/worker/CLAUDE.md) | バッチ処理・定期実行ワーカー |

### パッケージ

| パッケージ | ドキュメント | 概要 |
|-----------|-------------|------|
| api-contract | [packages/api-contract/CLAUDE.md](./packages/api-contract/CLAUDE.md) | Hono RPC クライアント |
| db | [packages/db/CLAUDE.md](./packages/db/CLAUDE.md) | Drizzle ORM + シード機能 |
| env | [packages/env/CLAUDE.md](./packages/env/CLAUDE.md) | 環境変数スキーマ |
| logger | [packages/logger/CLAUDE.md](./packages/logger/CLAUDE.md) | 構造化ロギング |
| schema | [packages/schema/CLAUDE.md](./packages/schema/CLAUDE.md) | API スキーマ定義 |

### その他

| ドキュメント | 概要 |
|-------------|------|
| [docs/architecture.md](./docs/architecture.md) | アーキテクチャ詳細 |
| [docs/development-flow.md](./docs/development-flow.md) | 開発フロー・ブランチ命名規則・コミット規則 |
| [docs/infra-setup.md](./docs/infra-setup.md) | インフラセットアップ |
