# Next.js + Hono + RN/expo Monorepo Template

Next.js 15（フロントエンド）と Hono（バックエンド）、RN/expo（ネイティブ）を使用したモノレポテンプレート
Turborepo + pnpm で管理し、Cloudflare Workers にデプロイ

## 主要技術

| 層 | 技術 |
|----|------|
| フロントエンド | Next.js 15, React 19, Tailwind CSS 4 |
| ネイティブ | React Native 0.81, Expo 54, Expo Router |
| バックエンド | Hono 4, Drizzle ORM |
| DB / 認証 | Supabase (PostgreSQL) |
| インフラ | Cloudflare Workers |
| ツール | Turborepo, pnpm, Biome |

## ドキュメントマップ

### アーキテクチャ・設計思想

| ドキュメント | 内容 |
|-------------|------|
| [docs/architecture.md](./docs/architecture.md) | 技術選定・全体像 |
| [docs/development-flow.md](./docs/development-flow.md) | 開発フロー |

### アプリケーション実装

| アプリ | 概要 | 実装レシピ |
|-------|------|-----------|
| API | [README.md](./apps/api/README.md) | [RECIPES.md](./apps/api/RECIPES.md) |
| Web | [README.md](./apps/web/README.md) | [RECIPES.md](./apps/web/RECIPES.md) |
| Native | [README.md](./apps/native/README.md) | [RECIPES.md](./apps/native/RECIPES.md) |
| Worker | [README.md](./apps/worker/README.md) | [RECIPES.md](./apps/worker/RECIPES.md) |

### 共有パッケージ

| パッケージ | ドキュメント | 役割 |
|-----------|-------------|------|
| @packages/db | [README.md](./packages/db/README.md) | Drizzle ORM・マイグレーション |
| @packages/schema | [README.md](./packages/schema/README.md) | API入出力スキーマ（Zod） |

### インフラ・ローカル環境

| ドキュメント | 内容 |
|-------------|------|
| [supabase/README.md](./supabase/README.md) | Supabaseローカル開発・Storage |

---

## 開発コマンド

### 基本

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 全アプリ起動（API + Web + Native + Drizzle Studio） |
| `pnpm build` | 全アプリビルド |
| `pnpm check` | Biomeチェック |
| `pnpm check:fix` | Biome自動修正 |
| `pnpm typecheck` | TypeScript型チェック |

### 個別プロジェクト

```bash
pnpm api dev      # APIのみ起動
pnpm web dev      # Webのみ起動
pnpm native dev   # Nativeのみ起動 (Expo)
pnpm api build    # APIのみビルド
pnpm web build    # Webのみビルド
```

### Worker（バッチ処理）

```bash
pnpm worker job <job-name>  # ジョブを単発実行
pnpm worker daemon          # デーモンモードで起動（cron スケジュール）
```

> 詳細は [apps/worker/README.md](./apps/worker/README.md) を参照

### データベース

| コマンド | 説明 |
|----------|------|
| `pnpm db:setup` | Supabase起動 + 環境変数更新 + migrate + seed |
| `pnpm db:generate` | マイグレーション生成 |
| `pnpm db:migrate` | マイグレーション適用 |
| `pnpm db:studio` | Drizzle Studio起動 |
| `pnpm db:seed` | シード実行 |
| `pnpm db:seed --force` | シード実行（上書きモード） |
| `pnpm db:seed --reset` | リセット後シード実行 |

> 詳細は [packages/db/README.md](./packages/db/README.md) を参照

### 環境変数

| コマンド | 説明 |
|----------|------|
| `pnpm env:update` | .env.exampleから.envを再生成 + Supabase設定を注入 |

> `.env.example`に変更があった場合に実行してください

---

## CI/CD

GitHub Actionsによる自動化：

| タイミング | 内容 |
|-----------|------|
| PR作成時 | Biome + 型チェック, プレビューデプロイ |
| mainマージ時 | 本番デプロイ |
| PRコメント | データベース操作コマンド |

### PRコメントによるDB操作

PRのコメントで以下のコマンドを実行できます。

#### 利用可能なコマンド

| コマンド | 説明 |
|----------|------|
| `/db migrate` | マイグレーション適用 |
| `/db seed` | シード投入（追記モード） |
| `/db seed --force` | シード投入（上書きモード） |
| `/db seed --reset` | 全リセット後シード投入 ⚠️ |
| `/db migrate-seed` | マイグレーション + シード |
| `/db rollback` | ロールバック（全テーブル削除 + mainのマイグレーション再適用）⚠️ |

> ⚠️ マークのコマンドは危険操作のため、`--confirm` フラグが必要です
> 例: `/db rollback --confirm`

#### 実行権限

| ロール | 条件 |
|--------|------|
| OWNER | 常に実行可能 |
| MEMBER / COLLABORATOR / CONTRIBUTOR | PRがApprove済みの場合のみ実行可能 |

#### 動作の詳細

- `migrate`: PRブランチのマイグレーションを本番DBに適用
- `seed`: PRブランチのシードを本番DBに投入
- `rollback`: 本番DBの全テーブルを削除し、**mainブランチ**のマイグレーションを再適用

---

## Git Hooks (lefthook)

| Hook | 実行内容 |
|------|----------|
| pre-commit | mainブランチコミット禁止, Biome |
| pre-push | TypeScript型チェック |

---

## 必要なSecrets

| Secret | 用途 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflareデプロイ |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflareアカウント |
| `DATABASE_URL` | PostgreSQL接続 |
| `SUPABASE_URL` | Supabase URL |
| `SUPABASE_ANON_KEY` | Supabase匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスロールキー |
