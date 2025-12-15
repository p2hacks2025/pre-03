# Backend Guide (apps/api)

## このファイルでわかること

- プロジェクトのディレクトリ構造と設計思想
- 新しいAPIエンドポイントなどを追加するときの基本的な流れ
- どこを触っていいか/悪いかの判断基準

## ディレクトリ構造

`routes → usecase → repository` の3層構造

```
src
├── app.ts
├── contract.ts
├── context.ts
├── config
├── infrastructure
├── middleware
├── repository
├── routes
│   └── {domain}
├── shared
│   └── error
└── usecase
    └── {domain}
```

- 🟢: よく触る想定
- 🟡: 特定の変更のときだけ
- 🚫: 基本的に触らなくてよい（困ったら相談）

| ファイル/ディレクトリ | 役割 | 触る頻度 |
|---------------------|------|---------|
| `routes/` | プレゼンテーション層（route.ts, handlers.ts, index.ts） | 🟢 API実装 |
| `usecase/` | ビジネスロジック | 🟢 API実装 |
| `repository/` | データアクセス層（DB操作） | 🟡 DB操作追加時 |
| `app.ts` | エントリーポイント。ルーター・ミドルウェア登録 | 🟡 ルーター追加時 |
| `middleware/` | Hono ミドルウェア | 🟡 MW追加時 |
| `config/` | 環境変数・ルーター設定 | 🟡 環境変数追加時 |
| `context.ts` | Hono Context 型定義 | 🟡 変数追加時 |
| `infrastructure/` | 外部サービス連携（DB, Supabase） | 🚫 稀 |
| `shared/` | 共有ユーティリティ（エラー処理など） | 🚫 稀 |
| `contract.ts` | HonoRPC 型エクスポート | 🚫 自動生成用 |

## 共通package

| パッケージ | 役割 | 触る頻度 |
|-----------|------|---------|
| `@packages/schema` | Zod スキーマ定義（API入出力） | 🟢 API実装 |
| `@packages/db` | Drizzle ORM スキーマ・マイグレーション | 🟡 テーブル追加時 |
| `@packages/env` | 環境変数の型定義・バリデーション | 🟡 環境変数追加時 |
| `@packages/logger` | ロギングユーティリティ | 🚫 稀 |
| `@packages/api-contract` | HonoRPC 型安全クライアント | 🚫 自動生成 |

---

## 新規実装時の基本的な流れ

### APIエンドポイントの追加

1. `@packages/schema` に入出力スキーマを定義
2. `routes/{domain}/route.ts` にルート定義
3. `routes/{domain}/handlers.ts` にハンドラー実装
4. `usecase/{domain}/` にユースケース実装
5. （必要なら）`repository/` にDB操作を追加
6. `routes/index.ts` でルーターをマウント
7. `pnpm api build:types` で型定義ビルド

→ 詳細な実装例は [RECIPES.md](./RECIPES.md#apiエンドポイントの追加) を参照

### Middlewareの追加

- **グローバル**: `app.ts` に `app.use("*", middleware)` で登録
- **ルート固有**: `route.ts` の `middleware: [...]` に追加

→ 詳細な実装例は [RECIPES.md](./RECIPES.md#middlewareの追加) を参照

### DB操作の追加

1. `@packages/db` にテーブルスキーマを追加
2. `repository/{entity}.ts` に操作関数を追加

→ 詳細は [packages/db/README.md](../../packages/db/README.md) を参照
