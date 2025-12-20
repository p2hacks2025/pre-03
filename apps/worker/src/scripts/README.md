# Demo Scripts

デモアカウント用のデータを生成するスクリプト集。

## 概要

| スクリプト | 説明 |
|-----------|------|
| `generate-demo-worlds.ts` | デモユーザーの weekly_worlds を生成（weekly-reset + daily-update） |
| `generate-demo-ai-posts.ts` | デモユーザーの投稿に対する AI 投稿を生成 |

## 実行手順

### 前提条件

- Supabase がローカルで起動していること（`pnpm db:setup`）
- 環境変数が設定されていること（`apps/worker/.env`）
  - `DATABASE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GOOGLE_API_KEY`（Gemini 画像生成用）
  - `OPENAI_API_KEY`（テキスト生成用）

### 1. シード実行

デモユーザーと CSV からの投稿を作成：

```bash
pnpm db:seed --reset
```

**作成されるもの:**
- デモユーザー: `demo@example.com`（パスワード: `password`）
- デモ投稿: `packages/db/src/seed/data/demo-posts.csv` の内容

### 2. Weekly Worlds 生成

デモユーザーの投稿から週間ワールドを生成：

```bash
pnpm worker script src/scripts/generate-demo-worlds.ts
```

**処理内容:**

各週を時系列順に処理：

1. **weekly-reset**: 前週の投稿からワールドを初期化
   - 最初の週: ベース画像でワールドを作成
   - 2週目以降: 前週の投稿からシーン記述を生成 → 2回画像生成

2. **daily-update**: 当週の各日の投稿で画像を更新
   - 日ごとにシーン記述を生成 → 画像生成

**所要時間:** 15件の投稿（3週間分）で約10〜20分（API rate limit 対策の遅延込み）

### 3. AI 投稿生成

デモユーザーの投稿に対する AI の反応を生成：

```bash
pnpm worker script src/scripts/generate-demo-ai-posts.ts
```

**処理内容:**
- 各投稿に対してランダムな AI プロフィールを選択
- AI 投稿を生成（OpenAI API）
- 投稿日の数分〜1時間後に公開されるように設定

## CSV フォーマット

`packages/db/src/seed/data/demo-posts.csv`:

```csv
content,created_at,image_url
今日は朝からランニングをした。...,2025-12-01T07:30:00Z,
友達とカフェで勉強会。...,2025-12-02T14:00:00Z,https://example.com/image.jpg
```

| カラム | 説明 | 必須 |
|--------|------|------|
| `content` | 投稿内容 | Yes |
| `created_at` | 投稿日時（ISO 8601形式、UTC） | Yes |
| `image_url` | 画像URL | No |

## トラブルシューティング

### API エラー

- **Rate limit**: スクリプトには遅延が組み込まれていますが、エラーが発生した場合は再実行してください
- **API キー**: 環境変数が正しく設定されているか確認

### デモユーザーが見つからない

シードが正常に実行されているか確認：

```bash
pnpm db:seed --reset
```

### 既存のワールドを再生成したい

1. DB Studio でデモユーザーの `weekly_worlds` を削除
2. スクリプトを再実行
