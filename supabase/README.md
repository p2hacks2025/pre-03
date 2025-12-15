# Supabase ローカル開発

このディレクトリは Supabase CLI によるローカル開発環境の設定を管理します。

## ディレクトリ構成

```
supabase/
├── config.toml       # Supabase CLI 設定
├── migrations/       # Drizzle ORM が生成するマイグレーション
│   ├── *.sql         # マイグレーションファイル
│   └── meta/         # Drizzle メタデータ
└── README.md         # このファイル
```

## コマンド

```bash
# Supabase 起動
pnpm exec supabase start

# Supabase 停止
pnpm exec supabase stop

# ステータス確認
pnpm exec supabase status

# DB リセット（マイグレーション再適用）
pnpm exec supabase db reset
```

> **Note**: supabase CLI はプロジェクトの devDependencies にインストールされているため、
> `pnpm exec` 経由で実行します。グローバルインストールは不要です。

---

## Supabase Storage

### 概要

Supabase Storage はファイルストレージ機能を提供します。このプロジェクトではユーザーアバター画像の保存に使用しています。

### アーキテクチャ（BFF パターン）

**リクエストフロー**

クライアント（ブラウザ） → Hono API（BFF） → Supabase Storage

**API 層の処理**

1. `authMiddleware` で JWT 検証
2. `SERVICE_ROLE_KEY` で Storage を操作（RLS バイパス）

**ポイント**:
- クライアントは直接 Supabase Storage にアクセスしない
- API 層で認証・認可を行い、SERVICE_ROLE_KEY で Storage を操作
- RLS ポリシーは設定しない（SERVICE_ROLE_KEY で完全にバイパスされるため）

### セキュリティの担保

RLS を使わない代わりに、以下でセキュリティを確保：

1. **authMiddleware** - JWT トークン検証
2. **ファイルパス設計** - `${userId}/filename` でユーザー別にファイルを分離
3. **usecase 内バリデーション** - ファイルサイズ、MIME タイプの検証

### バケット管理

**重要**: バケットの作成・管理はシード機能で行います（`supabase/config.toml` ではなく）。

```bash
# バケット作成（シード実行）
pnpm db:seed
```

理由:
- `config.toml` のバケット設定は新規 `supabase start` 時のみ適用される
- 既存の Docker ボリュームがある場合は設定が反映されない
- シード機能なら何度実行しても冪等（既存バケットは設定を更新）

### バケット一覧

| バケット | 用途 | 公開 | サイズ制限 | MIME タイプ |
|---------|------|------|-----------|------------|
| `avatars` | ユーザーアバター | 公開 | 5MB | JPEG, PNG, WebP |

### Storage の仕組み

Supabase Storage は `storage` スキーマ内の2つのテーブルで管理されます。

**buckets テーブル**

| カラム | 説明 |
|--------|------|
| `id` | バケット名 |
| `public` | 公開/非公開 |
| `file_size_limit` | ファイルサイズ上限 |
| `allowed_mime_types` | 許可 MIME タイプ |

**objects テーブル**

| カラム | 説明 |
|--------|------|
| `bucket_id` | 所属バケット |
| `name` | ファイルパス（`userId/timestamp.ext`）|

### シード実装

`packages/db/src/seed/seeders/storage.ts`:

```typescript
const STORAGE_BUCKETS = [
  {
    id: "avatars",
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  },
];

// バケット作成（既存なら設定を更新）
await ctx.adminSupabase.storage.createBucket("avatars", { ... });
// or
await ctx.adminSupabase.storage.updateBucket("avatars", { ... });
```

### 本番環境での運用

本番環境でも `/db seed` コマンドでバケットを作成・更新できます。

```bash
# GitHub PR コメントから実行
/db seed
```

または初回のみ Supabase Dashboard から手動作成：
- Storage → New bucket → 設定入力

---

## 参考リンク

- [Supabase Storage 公式ドキュメント](https://supabase.com/docs/guides/storage)
- [Supabase createBucket API](https://supabase.com/docs/reference/javascript/storage-createbucket)
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
