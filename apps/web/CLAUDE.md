# apps/web CLAUDE.md

Next.js 15 + App Router によるフロントエンドアプリケーション。Cloudflare Pages 上で動作し、Hono RPC を使用して apps/api と型安全に通信。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 + App Router |
| UI ライブラリ | shadcn/ui（Radix UI ベース） |
| スタイリング | Tailwind CSS 4 |
| フォーム | react-hook-form + Zod |
| API 通信 | Hono RPC（@packages/api-contract） |
| 認証 | HttpOnly Cookie + AuthContext |
| 環境変数 | @t3-oss/env-core |
| ロギング | @packages/logger |
| デプロイ | Cloudflare Pages（@opennextjs/cloudflare） |

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [README.md](./README.md) | ディレクトリ構造と触る頻度の目安 |
| [RECIPES.md](./RECIPES.md) | 具体的なコード例付きの実装パターン集 |

---

## アーキテクチャ全体像

### Colocation-First 設計

ページ固有のコンポーネント・ロジックを `page.tsx` と同階層に配置する設計を採用。

**設計原則**:

1. **ローカル優先**: ページ固有のものは `_components/`, `_lib/` に配置
2. **共有は昇格**: 3箇所以上で使用するものは `components/` へ昇格
3. **`_` プレフィックス**: Next.js のルーティングから除外 + 内部実装であることを明示

**ディレクトリパターン**:

```
app/{route}/
├── page.tsx              # ページコンポーネント
├── _components/          # ページローカルコンポーネント
│   └── {component}.tsx
└── _lib/                 # ページローカルロジック
    └── validations.ts
```

### HttpOnly Cookie 認証

セキュアな認証方式を採用。localStorage は使用しない。

**認証フロー**:

1. ログイン/サインアップ時に API が HttpOnly Cookie をセット
2. `credentials: 'include'` で Cookie を自動送信
3. ページロード時に `/user/me` API で認証状態を確認
4. ログアウト時に API が Cookie を削除

---

## プロジェクト構造

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # ルートレイアウト（AuthProvider）
│   ├── page.tsx                  # ホームページ
│   ├── globals.css               # グローバルスタイル（Tailwind）
│   ├── auth/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       └── login-form.tsx
│   │   └── signup/
│   │       ├── page.tsx
│   │       ├── _components/
│   │       │   └── signup-form.tsx
│   │       └── _lib/
│   │           └── validations.ts
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── user-info.tsx
│   │       └── avatar-upload.tsx
│   └── health/
│       └── page.tsx              # Server Component（async）
│
├── components/
│   ├── ui/                       # shadcn/ui コンポーネント
│   └── common/                   # 複数ページ共有コンポーネント
│
├── contexts/
│   └── auth-context.tsx          # 認証状態管理（React Context）
│
├── lib/
│   ├── api.ts                    # Hono RPC クライアント（Client Component 用）
│   ├── api-server.ts             # Hono RPC クライアント（Server Component 用）
│   ├── logger.ts                 # ロガー初期化
│   └── utils.ts                  # ユーティリティ（cn関数）
│
├── env.ts                        # 環境変数バリデーション
└── middleware.ts                 # リクエストログ・ID管理
```

---

## 共通パッケージとの関係

### パッケージ一覧

| パッケージ | 役割 |
|-----------|------|
| `@packages/api-contract` | Hono RPC クライアント生成（createClient, postMultipart） |
| `@packages/schema` | API 入出力スキーマ（Zod + 型定義） |
| `@packages/env` | 環境変数の型定義・バリデーション |
| `@packages/logger` | ロギングユーティリティ |

### 型共有フロー

```
[1] API ルート定義
    apps/api/src/routes/ → export const routes

[2] 型エクスポート
    apps/api/src/contract.ts → export type AppType

[3] 型定義ビルド（pnpm api build:types）
    → apps/api/types/contract.d.ts 生成

[4] api-contract パッケージで参照
    @packages/api-contract → createClient 関数を提供

[5] フロントエンドで使用
    apps/web/src/lib/api.ts → 型安全な API 呼び出し
```

---

## UI ライブラリ（shadcn/ui）

Radix UI をベースにした、カスタマイズ可能なコンポーネントライブラリ。

### 導入済みコンポーネント

| コンポーネント | ファイル | 用途 |
|--------------|---------|------|
| Avatar | `components/ui/avatar.tsx` | アバター表示 |
| Badge | `components/ui/badge.tsx` | ステータスラベル |
| Button | `components/ui/button.tsx` | ボタン（6 variants） |
| Card | `components/ui/card.tsx` | カードレイアウト |
| Form | `components/ui/form.tsx` | react-hook-form 統合 |
| Input | `components/ui/input.tsx` | テキスト入力 |
| Label | `components/ui/label.tsx` | フォームラベル |

### コンポーネント追加

```bash
# 新しいコンポーネントを追加
pnpm dlx shadcn@latest add <component-name>

# 例: Dialog を追加
pnpm dlx shadcn@latest add dialog
```

### 設定ファイル

- `components.json`: shadcn/ui 設定
- パスエイリアス: `@/components/ui/*`

---

## 各レイヤーの役割

### app/（プレゼンテーション層）

ページコンポーネントとルーティング。

| ファイル | 役割 |
|---------|------|
| `page.tsx` | ページコンポーネント（Client or Server） |
| `_components/` | ページローカルコンポーネント |
| `_lib/` | ページローカルロジック（validations, hooks） |

→ 実装例は [RECIPES.md](./RECIPES.md#ページの追加) を参照

### components/（UI 層）

再利用可能な UI コンポーネント。

| フォルダ | 役割 |
|---------|------|
| `ui/` | shadcn/ui コンポーネント |
| `common/` | 複数ページで使用する独自コンポーネント |

### contexts/（状態管理層）

グローバル状態を管理する React Context。

| Context | 提供する状態 | 提供するメソッド |
|---------|-------------|-----------------|
| `AuthContext` | `user`, `profile`, `isLoading` | `login`, `signup`, `logout`, `updateProfile` |

→ 認証付きページの実装例は [RECIPES.md](./RECIPES.md#認証付きページの追加) を参照

### lib/（ユーティリティ層）

グローバルなユーティリティと API クライアント。

| ファイル | 役割 |
|---------|------|
| `api.ts` | Client Component 用 API クライアント |
| `api-server.ts` | Server Component 用 API クライアント |
| `logger.ts` | ロガー初期化 |
| `utils.ts` | `cn` 関数（Tailwind クラス結合） |

### API クライアントの使い分け

| クライアント | 用途 | 認証 |
|-------------|------|------|
| `publicClient` | 認証不要エンドポイント | なし |
| `client` | 認証必要エンドポイント（Client Component） | HttpOnly Cookie 自動送信 |
| `createServerClient()` | Server Component / Server Actions | Cookie → Authorization ヘッダー変換 |

→ API 呼び出しの実装例は [RECIPES.md](./RECIPES.md#認証付きページの追加) を参照

---

## 参考にするべきファイル

### 新規ページ追加時

| 参考ファイル | 内容 |
|-------------|------|
| `app/auth/signup/page.tsx` | Client Component ページの例 |
| `app/auth/signup/_components/signup-form.tsx` | フォームコンポーネントの例 |
| `app/auth/signup/_lib/validations.ts` | バリデーションスキーマ拡張の例 |
| `app/health/page.tsx` | Server Component ページの例 |

### パターン別参考ファイル

| パターン | 参考ファイル |
|---------|-------------|
| 認証付きページ | `app/dashboard/page.tsx`（useAuth + リダイレクト） |
| フォーム実装 | `app/auth/login/_components/login-form.tsx` |
| ファイルアップロード | `app/dashboard/_components/avatar-upload.tsx` |
| Server Component | `app/health/page.tsx` |

---

## 開発コマンド

> **Note**: monorepo 構成のため、実行するディレクトリに注意。
> ルート（`/`）から実行する場合は `pnpm web <command>` を使用。

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー起動（localhost:4000） |
| `pnpm build` | 本番ビルド（.next/ 生成） |
| `pnpm build:worker` | Cloudflare 用ビルド（.open-next/ 生成） |
| `pnpm start` | Node.js サーバーで実行 |
| `pnpm preview` | OpenNext プレビュー |
| `pnpm deploy` | Cloudflare Pages デプロイ |
| `pnpm typecheck` | 型チェック |
| `pnpm check` | Biome チェック |
| `pnpm check:fix` | Biome 自動修正 |

---

## 環境変数

### クライアント側環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | API エンドポイント URL | Yes |

### サーバー側環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `ENVIRONMENT` | 環境識別子 | No |
| `LOG_LEVEL` | ログレベル | No |

### 開発環境

環境変数は `.env.local` ファイルで設定（git 無視）。

> **Note**: `.env` ファイルはセキュリティ上の理由から Claude Code では読み取れません。

---

## 参考リンク

- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [shadcn/ui 公式](https://ui.shadcn.com/)
- [Hono RPC](https://hono.dev/docs/guides/rpc)
- [@opennextjs/cloudflare](https://opennext.js.org/cloudflare)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [react-hook-form](https://react-hook-form.com/)
