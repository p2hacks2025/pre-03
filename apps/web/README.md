# Frontend Guide (apps/web)

## このファイルでわかること

- プロジェクトのディレクトリ構造と設計思想
- 新しいページやコンポーネントを追加するときの基本的な流れ
- どこを触っていいか/悪いかの判断基準

## ディレクトリ構造

`app/ -> components/ -> lib/` の colocation-first 構造

```
src
├── app                       # Next.js App Router
│   ├── {route}/
│   │   ├── page.tsx          # ページコンポーネント
│   │   ├── _components/      # ページローカルコンポーネント
│   │   └── _lib/             # ページローカルロジック
│   └── layout.tsx
├── components
│   ├── ui/                   # shadcn/ui コンポーネント
│   └── common/               # 複数ページ共有コンポーネント
├── contexts                  # グローバル Context
├── lib                       # グローバルユーティリティ
└── middleware.ts             # リクエストログ・ID管理
```

- 🟢: よく触る想定
- 🟡: 特定の変更のときだけ
- 🚫: 基本的に触らなくてよい（困ったら相談）

| ファイル/ディレクトリ | 役割 | 触る頻度 |
|---------------------|------|---------|
| `app/{route}/page.tsx` | ページコンポーネント | 🟢 ページ実装 |
| `app/{route}/_components/` | ページローカルコンポーネント | 🟢 ページ実装 |
| `app/{route}/_lib/` | ページローカルロジック（validations, hooks） | 🟢 ページ実装 |
| `components/ui/` | shadcn/ui コンポーネント | 🟡 UI追加時 |
| `components/common/` | 複数ページ共有コンポーネント | 🟡 共有化時 |
| `middleware.ts` | リクエストログ・ID管理 | 🚫 稀 |
| `env.ts` | 環境変数定義 | 🟡 環境変数追加時 |
| `lib/api.ts` | API クライアント（Client Component 用） | 🚫 稀 |
| `lib/api-server.ts` | API クライアント（Server Component 用） | 🚫 稀 |
| `contexts/auth-context.tsx` | 認証状態管理 | 🚫 稀 |
| `app/layout.tsx` | ルートレイアウト | 🚫 稀 |

## 共通 package

| パッケージ | 役割 | 触る頻度 |
|-----------|------|---------|
| `@packages/schema` | Zod スキーマ定義（フォームバリデーション、型） | 🚫 バックエンド定義 |
| `@packages/api-contract` | Hono RPC クライアント生成 | 🚫 自動生成 |
| `@packages/env` | 環境変数の型定義・バリデーション | 🟡 環境変数追加時 |
| `@packages/logger` | ロギングユーティリティ | 🚫 稀 |

---

## 新規実装時の基本的な流れ

### ページの追加

1. `app/{route}/page.tsx` にページコンポーネントを作成
2. `app/{route}/_components/` にページ固有コンポーネントを配置
3. （必要なら）`app/{route}/_lib/` にバリデーション・hooks を配置
4. UI コンポーネントは `components/ui/` から import

-> 詳細な実装例は [RECIPES.md](./RECIPES.md#ページの追加) を参照

### 認証付きページの追加

1. 上記「ページの追加」と同じ手順でファイルを作成
2. page.tsx で `useAuth` による認証チェックとリダイレクト処理を実装

-> 詳細な実装例は [RECIPES.md](./RECIPES.md#認証付きページの追加) を参照

### フォーム機能の追加

1. `@packages/schema` のスキーマを使用（または `_lib/validations.ts` で拡張）
2. `react-hook-form` + `@hookform/resolvers/zod` でフォーム状態管理
3. `components/ui/form` の FormField でフィールドを構築

### ファイルアップロード機能の追加

1. `_components/` にアップロード UI コンポーネントを作成
2. `postMultipart` ヘルパーで multipart/form-data を送信

-> 詳細な実装例は [RECIPES.md](./RECIPES.md#ファイルアップロード) を参照
