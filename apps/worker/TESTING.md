# Worker テストガイド

daily-update ジョブのローカルテスト手順。

## 前提条件

1. Supabase ローカル環境が起動していること
2. `.env` ファイルが設定されていること

## 環境変数

```bash
# apps/worker/.env に設定が必要
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GOOGLE_API_KEY=<your-google-api-key>
ONESIGNAL_APP_ID=<uuid-format>
ONESIGNAL_REST_API_KEY=<your-onesignal-rest-api-key>
```

## テストデータのセットアップ

### 1. シードの実行

```bash
# 初回またはデータをリセットする場合
pnpm db:seed --reset

# 追記モード（既存データを維持）
pnpm db:seed
```

### 2. シードで作成されるデータ

| データ | 説明 |
|--------|------|
| `worker@example.com` | テスト用ユーザー（password: `password`） |
| `weekly_worlds` | 今週の WeeklyWorld レコード（初期画像付き） |
| `user_posts` | 意味のある日本語の投稿 9件（今日〜1週間前） |

投稿データ例:
- 今日: ランニング、読書
- 昨日: パン作り、友人とカフェ
- 2日前: プログラミング学習
- 3日前: 映画鑑賞、料理
- 5日前: ハイキング
- 1週間前: ノート購入

## daily-update ジョブのテスト

### 通常実行（昨日の投稿を処理）

```bash
pnpm worker job daily-update
```

### 特定日付を指定して実行

```bash
# 2025-12-14 の投稿を処理
TARGET_DATE=2025-12-14 pnpm worker job daily-update-date
```

### 処理の流れ

1. 指定日の投稿を取得（`getUserPostsByDate`）
2. 投稿者の `weekly_world` を取得
3. 空きフィールドを選択（`selectFieldId`）
4. Gemini API で画像生成（`generateImage`）
5. Storage に画像をアップロード
6. `weekly_world` の画像URLを更新
7. `world_build_logs` にログを記録

## トラブルシューティング

### `Weekly world not found` エラー

シードが実行されていないか、週が変わった可能性があります。

```bash
pnpm db:seed --reset
```

### 投稿が見つからない

`TARGET_DATE` がシードデータの日付範囲外の可能性があります。シードは実行時の日付を基準に投稿を作成するため、シードを再実行してください。

```bash
pnpm db:seed --reset
```

## 関連ファイル

| ファイル | 説明 |
|----------|------|
| `packages/db/src/seed/seeders/users.ts` | ユーザーシーダー |
| `packages/db/src/seed/seeders/weekly-worlds.ts` | WeeklyWorld シーダー |
| `packages/db/src/seed/seeders/worker-posts.ts` | 投稿シーダー |
| `apps/worker/src/jobs/daily-update.ts` | daily-update ジョブ |
| `apps/worker/src/jobs/daily-update-date.ts` | 日付指定版 daily-update |
