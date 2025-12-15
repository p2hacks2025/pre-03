# @packages/db CLAUDE.md

Drizzle ORM を使用したデータベース関連機能を提供するパッケージ。PostgreSQL スキーマ定義、マイグレーション管理、シード機能を含む。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| ORM | Drizzle ORM |
| データベース | PostgreSQL（Supabase） |
| マイグレーション | drizzle-kit |
| 環境変数 | @t3-oss/env-core |
| シード | tsx + Supabase Admin SDK |

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [README.md](./README.md) | ディレクトリ構造・スキーマ定義ガイド |
| [RECIPES.md](./RECIPES.md) | 具体的なコード例付きの実装パターン集 |

---

## ディレクトリ構造

```
packages/db/
├── src/
│   ├── index.ts               # エクスポート統合
│   ├── client.ts              # DBクライアント初期化
│   ├── schema/
│   │   ├── index.ts           # スキーマ統合エクスポート
│   │   ├── auth.ts            # 認証テーブル型定義（Supabase）
│   │   ├── profiles.ts        # プロフィールテーブル定義
│   │   └── relations.ts       # テーブル間リレーション
│   └── seed/
│       ├── index.ts           # シードエントリーポイント
│       ├── runner.ts          # シード実行エンジン
│       ├── seeders/
│       │   ├── index.ts       # Seeder型定義
│       │   ├── storage.ts     # [Infrastructure] Storageバケット作成
│       │   └── users.ts       # [Data] テストユーザー作成
│       └── utils/
│           └── reset.ts       # Supabaseユーザーリセット
├── drizzle.config.ts          # Drizzle設定
├── package.json
└── tsconfig.json
```

---

## 依存関係

### このパッケージの立ち位置

```
@packages/env
    ↑
@packages/db   ← env に依存
    ↑
apps/api      ← db を使用
```

**特徴**:
- `@packages/env` に依存（環境変数スキーマ）
- `apps/api` から使用される
- データベース関連の責務を集約

### ワークスペース依存

| パッケージ | 用途 |
|-----------|------|
| `@packages/env` | 環境変数スキーマ（`dbKeys`） |

### 外部依存

| パッケージ | 用途 |
|-----------|------|
| `drizzle-orm` | ORM（PostgreSQL） |
| `postgres` | PostgreSQL ドライバ |
| `@t3-oss/env-core` | 環境変数バリデーション |

### 開発依存

| パッケージ | 用途 |
|-----------|------|
| `drizzle-kit` | マイグレーションツール |
| `tsx` | TypeScript実行（シード用） |
| `@supabase/supabase-js` | Supabase Admin SDK（シード用） |

### 参照元

| パッケージ | 使用内容 |
|-----------|----------|
| `apps/api` | `createDbClient`, `DbClient`, スキーマ |

---

## 主要ファイルの概要

### src/index.ts

エクスポート統合ポイント。

| エクスポート | 用途 |
|-------------|------|
| `eq`, `and`, `or`, `not`, `sql` | Drizzle ORM ユーティリティ |
| `createDbClient`, `DbClient` | DB クライアント |
| スキーマ全体 | テーブル定義・型 |

### src/client.ts

データベースクライアントを初期化。`createDbClient(connectionString)` で DB 接続を作成。

### src/schema/

| ファイル | 役割 |
|---------|------|
| `auth.ts` | Supabase `auth.users` の型定義 |
| `profiles.ts` | プロフィールテーブル定義 |
| `relations.ts` | テーブル間リレーション |
| `index.ts` | スキーマ統合エクスポート |

→ スキーマ定義の書き方は [README.md](./README.md#drizzle-orm-スキーマ定義ガイド) を参照

### drizzle.config.ts

Drizzle Kit の設定。マイグレーションは `supabase/migrations/` に出力。

---

## シード機能

### 概要

環境初期化のためのシード機能を提供。2種類のシーダーを管理。

### シーダー分類

| 種類 | 目的 | 冪等性 | 例 |
|------|------|--------|-----|
| **Infrastructure** | インフラ初期化（バケット、RLSポリシー等） | あり | `storageSeeder` |
| **Data** | テストデータ投入 | なし | `usersSeeder` |

**実行順序**:
1. Infrastructure Seeders（他のシーダーが依存する可能性があるため先に実行）
2. Data Seeders

### Seeder インターフェース

| メソッド | 必須 | 説明 |
|---------|------|------|
| `name` | Yes | シーダー名 |
| `seed(ctx)` | Yes | データ投入処理 |
| `reset(ctx)` | No | データ削除処理 |

### 実行モード

| フラグ | 動作 |
|--------|------|
| なし | 追記モード（既存データに追加） |
| `--force` | 上書きモード（重複時に更新） |
| `--reset` | リセットモード（データ削除後に投入） |

→ シーダーの実装例は [RECIPES.md](./RECIPES.md) を参照

---

## 開発コマンド

| コマンド | 説明 |
|----------|------|
| `pnpm db:generate` | マイグレーションファイル生成 |
| `pnpm db:migrate` | ローカルDBにマイグレーション適用 |
| `pnpm db:push` | スキーマを直接DBにプッシュ（開発用） |
| `pnpm db:studio` | Drizzle Studio（GUI管理ツール）起動 |
| `pnpm db:seed` | シード実行 |
| `pnpm check` | Biome によるコード品質チェック |
| `pnpm check:fix` | Biome による自動修正 |
| `pnpm typecheck` | TypeScript 型チェック |

### シードコマンド詳細（ローカル）

```bash
# 追記モード
pnpm db:seed

# 上書きモード
pnpm db:seed --force

# リセットモード（確認必要）
pnpm db:seed --reset
```

---

## GitHub Actions コマンド（PR コメント）

PRコメントで `/db` コマンドを実行することで、リモート環境のデータベース操作が可能。

### コマンド一覧

| コマンド | 説明 |
|----------|------|
| `/db migrate` | マイグレーション適用 |
| `/db seed` | シード投入（追記モード） |
| `/db seed --force` または `/db seed -f` | シード投入（上書きモード） |
| `/db seed --reset` または `/db seed -r` | 全リセット後シード投入 |
| `/db migrate-seed` | マイグレーション + シード投入 |
| `/db rollback` | ロールバック（全テーブル削除 + main ブランチのマイグレーション再適用） |

### 権限

| ロール | 実行条件 |
|--------|----------|
| OWNER | 常に実行可能 |
| MEMBER / COLLABORATOR / CONTRIBUTOR | PR が Approve されている必要あり |

### 危険な操作の確認

以下のコマンドは `--confirm` フラグが必要：

- `/db rollback --confirm` - すべてのテーブルを削除
- `/db seed --reset --confirm` - 既存のシードデータをすべて削除

### 実行ブランチ

| コマンド | チェックアウトするブランチ |
|----------|---------------------------|
| `/db rollback` | `main` ブランチ |
| その他 | PR のブランチ |

---

## 参考にするべきファイル

### 新規テーブル追加時

| 参考ファイル | 内容 |
|-------------|------|
| `src/schema/profiles.ts` | テーブル定義の例 |
| `src/schema/relations.ts` | リレーション定義の例 |
| `src/schema/index.ts` | エクスポートの例 |

### パターン別参考ファイル

| パターン | 参考ファイル |
|---------|-------------|
| テーブル定義 | `src/schema/profiles.ts` |
| 外部キー参照 | `src/schema/profiles.ts`（authUsers 参照） |
| リレーション | `src/schema/relations.ts` |
| Infrastructure シーダー | `src/seed/seeders/storage.ts` |
| Data シーダー | `src/seed/seeders/users.ts` |

→ 詳細な実装例は [RECIPES.md](./RECIPES.md) を参照

---

## Supabase との連携

### auth.users テーブル

Supabase が管理する認証テーブル。Drizzle ORM では `authUsers` として参照可能。

```typescript
import { authUsers } from "drizzle-orm/supabase";
```

### シードでの Supabase Admin SDK

シーダーの `SeederContext` から `supabaseAdmin` を使用してユーザー作成・削除が可能。

→ 実装例は [RECIPES.md](./RECIPES.md) を参照

---

## トラブルシューティング

### マイグレーションが失敗する

```bash
# 環境変数を確認
echo $DATABASE_URL

# マイグレーション状態を確認
pnpm db:studio
```

### 型が更新されない

```bash
# TypeScript キャッシュをクリア
pnpm clean
pnpm typecheck
```

### シードが失敗する

環境変数を確認：
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`（必須）

---

## 参考リンク

- [Drizzle ORM 公式](https://orm.drizzle.team/)
- [Drizzle PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-new)
- [Supabase](https://supabase.com/docs)
