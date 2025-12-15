# monorepo-template インフラセットアップ手順

## はじめに

基本的に読む必要のないドキュメントです。<br />
プロジェクトを新規にセットアップする際に必要な手順をまとめています。

## 前提作業

- Cloudflareアカウントの作成
- Supabaseアカウントの作成
- Vercelアカウントの作成(Turborepo連携用)

- `supabase/config.toml`の`project_id`を変更
- `package.json`の`name`を変更
- `wrangler.json`の`name`を変更 (apps/api, apps/web)

## セットアップ手順

### Cloudflare Workers

1. 以下の環境変数を用意
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` (Cloudflare WorkersのテンプレートでOK)

2. GitHubリポジトリのsecretsに追加
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

3. GitHubリポジトリのvariablesに追加

- `CF_WORKERS_SUBDOMAIN` (Cloudflare Workersのサブドメイン)
- `NEXT_PUBLIC_API_BASE_URL` (Cloudflare Workers APIのURL)

### Supabase

1. Supabaseで新しいプロジェクトを作成
2. 以下の環境変数を用意
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

3. GitHubリポジトリのsecretsに追加
- `DATABASE_URL` (Session poolerのURLを使用)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Cloudflare Workers (API側)にSupabaseの環境変数を追加
- `DATABASE_URL` (Direct connectionのURLを使用 ※HYPERDRIVEに登録するURLと同じ)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Vercel

1. 以下の環境変数を用意
- `TURBO_TOKEN`
- `TURBO_TEAM`

2. GitHubリポジトリのsecretsに追加
- `TURBO_TOKEN`

3. GitHubリポジトリのvariablesに追加
- `TURBO_TEAM`

### その他
- [API用wrangler](../apps/api/wrangler.json) で `HYPERDRIVE` と `ALLOWED_ORIGINS` を更新

HYPERDRIVEのID生成方法
```bash
npx wrangler hyperdrive create supabase-db \
  --connection-string="<YOUR_DATABASE_URL>"
```

出てきたIDを`wrangler.json`の`HYPERDRIVE`に設定してください。

> `<YOUR_DATABASE_URL>`はDirect connectionのURLを使用してください。<br />
> Hyperdriveがコネクションプールを管理するため、Supabase側のプーラー（Supavisor）は不要です。

後から再確認する場合
```bash
npx wrangler hyperdrive list
```
