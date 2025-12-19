# apps/native CLAUDE.md

React Native + Expo によるモバイルアプリケーション。Hono RPC を使用して apps/api と型安全に通信。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React Native 0.81.5 + Expo ~54 |
| ルーティング | Expo Router ~6 |
| UI ライブラリ | HeroUI Native 1.0.0-beta |
| スタイリング | Uniwind（TailwindCSS for React Native） |
| フォーム | react-hook-form + Zod |
| API 通信 | Hono RPC（@packages/api-contract） |
| 認証 | expo-secure-store + AuthContext |
| 環境変数 | expo-constants + Zod |
| ロギング | @packages/logger |

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [README.md](./README.md) | ディレクトリ構造と触る頻度の目安 |
| [RECIPES.md](./RECIPES.md) | 具体的なコード例付きの実装パターン集 |

---

## UI ライブラリ（HeroUI Native）

**重要**: HeroUI Native は最近リリースされたばかりの UI ライブラリで、公開情報が限られている。

### MCP サーバー

HeroUI Native の情報は **MCP サーバー経由で取得可能**。以下のツールが利用できる:

| ツール | 用途 |
|--------|------|
| `mcp__heroui-native__list_components` | 利用可能なコンポーネント一覧を取得 |
| `mcp__heroui-native__get_component_info` | コンポーネントの詳細情報（props, anatomy）を取得 |
| `mcp__heroui-native__get_component_props` | コンポーネントの props 定義を取得 |
| `mcp__heroui-native__get_component_examples` | コンポーネントの使用例を取得 |
| `mcp__heroui-native__get_theme_info` | テーマカラー・デザイントークンを取得 |
| `mcp__heroui-native__get_docs` | 公式ドキュメントを取得 |
| `mcp__heroui-native__installation` | インストールガイドを取得 |

**コンポーネント実装時のワークフロー**:

```
list_components → get_component_info → get_component_examples
```

### 導入済みコンポーネント（使用例）

| コンポーネント | 用途 |
|--------------|------|
| Button | ボタン |
| Card | カードレイアウト |
| Chip | ステータスラベル |
| Divider | 区切り線 |
| Spinner | ローディング |
| TextField | テキスト入力 |
| Toast / useToast | 通知表示 |

### スタイリング（Uniwind）

```tsx
import { View, Text } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

// TailwindCSS クラスが使える
<StyledView className="flex-1 items-center justify-center bg-background">
  <StyledText className="text-foreground font-bold">Hello</StyledText>
</StyledView>
```

---

## アーキテクチャ全体像

### Feature + Screen 分離型構造

`app/ → screens/ → features/` の分離型構造を採用。

**設計原則**:

1. **app/**: ルーティング定義のみ（Expo Router）
2. **screens/**: 画面コンポーネント（レイアウト + Feature 組み合わせ）
3. **features/**: 機能単位の UI・ロジック（再利用可能）

**依存の方向**:

```
app/（ルーティング層）
    ↓ re-export
screens/（プレゼンテーション層）
    ↓ 使用
features/（機能層）
    ↓ 使用
lib/（ユーティリティ層）
```

### SecureStore 認証

モバイル向けのセキュアな認証方式を採用。

**認証フロー**:

1. ログイン/サインアップ時に API からトークンを取得
2. `expo-secure-store` でトークンを安全に保存
3. API 呼び出し時に Authorization ヘッダーにトークンを付与
4. アプリ起動時に保存済みトークンで認証状態を復元

---

## プロジェクト構造

```
apps/native/
├── app/                          # Expo Router（ルーティング層）
│   ├── _layout.tsx               # ルートレイアウト（Provider 設定）
│   ├── index.tsx                 # エントリーポイント
│   ├── (app)/                    # 認証必須グループ
│   │   ├── _layout.tsx           # 認証ガード
│   │   ├── (tabs)/               # タブナビゲーション
│   │   │   ├── _layout.tsx       # タブレイアウト
│   │   │   ├── index.tsx         # ホーム画面
│   │   │   ├── profile.tsx       # プロフィール画面
│   │   │   └── reflection/       # 振り返り画面
│   │   │       ├── _layout.tsx
│   │   │       ├── index.tsx     # カレンダー画面
│   │   │       └── [week].tsx    # 週詳細画面（動的ルート）
│   │   ├── diary/                # 日記機能
│   │   │   ├── _layout.tsx
│   │   │   └── new.tsx           # 新規日記作成
│   │   └── health.tsx            # ヘルスチェック画面
│   └── (auth)/                   # 認証不要グループ
│       ├── _layout.tsx           # 認証グループレイアウト
│       ├── health.tsx            # ヘルスチェック画面
│       ├── login.tsx             # ログイン画面
│       └── signup.tsx            # サインアップ画面
│
├── src/
│   ├── screens/                  # 画面コンポーネント
│   │   ├── auth/
│   │   │   ├── health-screen.tsx
│   │   │   ├── login-screen.tsx
│   │   │   └── signup-screen.tsx
│   │   ├── diary/
│   │   │   └── diary-input-screen.tsx
│   │   ├── home/
│   │   │   └── home-screen.tsx
│   │   ├── profile/
│   │   │   └── profile-screen.tsx
│   │   └── reflection/
│   │       ├── calendar-screen.tsx
│   │       └── detail-screen.tsx
│   │
│   ├── features/                 # 機能単位のUI・ロジック
│   │   ├── auth/                 # 認証機能
│   │   ├── calendar/             # カレンダー機能
│   │   ├── health/               # ヘルスチェック機能
│   │   ├── profile/              # プロフィール機能
│   │   ├── reflection/           # 振り返り機能
│   │   └── timeline/             # タイムライン機能
│   │
│   ├── contexts/
│   │   └── auth-context.tsx      # 認証状態管理（React Context）
│   │
│   ├── lib/
│   │   ├── api.ts                # Hono RPC クライアント
│   │   ├── env.ts                # 環境変数バリデーション
│   │   ├── logger.ts             # ロガー初期化
│   │   ├── multipart.ts          # multipart/form-data ヘルパー
│   │   └── onesignal.ts          # OneSignal プッシュ通知
│   │
│   └── globals.css               # グローバルスタイル（Uniwind）
│
├── assets/                       # 画像・フォント
├── app.config.ts                 # Expo 設定
└── package.json
```

---

## 共通パッケージとの関係

### パッケージ一覧

| パッケージ | 役割 |
|-----------|------|
| `@packages/api-contract` | Hono RPC クライアント生成（createClient） |
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

[5] Native アプリで使用
    apps/native/src/lib/api.ts → 型安全な API 呼び出し
```

---

## 各レイヤーの役割

### app/（ルーティング層）

Expo Router によるルーティング定義のみ。

| ファイル | 役割 |
|---------|------|
| `_layout.tsx` | レイアウト（Provider、認証ガード） |
| `{route}.tsx` | Screen を re-export |

**ルートグループ**:

| グループ | 役割 | 認証 |
|---------|------|------|
| `(app)` | 認証必須画面 | 必要（ガード付き） |
| `(auth)` | 認証画面 | 不要 |

### screens/（プレゼンテーション層）

画面全体のレイアウトを担当。features/ のコンポーネントを組み合わせる。

→ 実装例は [RECIPES.md](./RECIPES.md#画面の追加) を参照

### features/（機能層）

機能単位の再利用可能なコンポーネント・フック・ロジック。

| ディレクトリ | 役割 |
|-------------|------|
| `components/` | 機能固有の UI コンポーネント |
| `hooks/` | 機能固有のカスタムフック |
| `lib/` | バリデーション、ユーティリティ |
| `types.ts` | 機能固有の型定義 |
| `index.ts` | barrel export |

→ 実装例は [RECIPES.md](./RECIPES.md#機能の追加) を参照

### contexts/（状態管理層）

グローバル状態を管理する React Context。

| Context | 提供する状態 | 提供するメソッド |
|---------|-------------|-----------------|
| `AuthContext` | `user`, `profile`, `accessToken`, `isLoading`, `isAuthenticated` | `login`, `signup`, `logout`, `updateProfile`, `refreshAuth` |

### lib/（ユーティリティ層）

グローバルなユーティリティと API クライアント。

| ファイル | 役割 |
|---------|------|
| `api.ts` | Hono RPC クライアント |
| `env.ts` | 環境変数パース（Android エミュレータ対応含む） |
| `logger.ts` | ロガー初期化 |

### API クライアントの使い分け

| クライアント | 用途 | 認証 |
|-------------|------|------|
| `client` | 認証不要エンドポイント（ヘルスチェック等） | なし |
| `createAuthenticatedClient(token)` | 認証必須エンドポイント | Bearer トークン |

→ API 呼び出しの実装例は [RECIPES.md](./RECIPES.md#api-呼び出し) を参照

---

## 参考にするべきファイル

### 新規画面追加時

| 参考ファイル | 内容 |
|-------------|------|
| `app/(app)/(tabs)/index.tsx` | タブ画面のルートファイルの例 |
| `src/screens/home/home-screen.tsx` | 画面コンポーネントの例 |
| `app/(app)/_layout.tsx` | 認証ガード付きレイアウトの例 |
| `app/(app)/(tabs)/_layout.tsx` | タブナビゲーションの例 |

### パターン別参考ファイル

| パターン | 参考ファイル |
|---------|-------------|
| フォーム実装 | `src/features/auth/components/login-form.tsx` |
| 認証付き画面 | `app/(app)/_layout.tsx`（認証ガード） |
| API 呼び出し | `src/features/health/hooks/use-health-check.ts` |
| トークン管理 | `src/features/auth/lib/token-storage.ts` |
| バリデーション拡張 | `src/features/auth/lib/validations.ts` |
| カレンダー実装 | `src/features/calendar/components/calendar.tsx` |
| タイムライン実装 | `src/features/timeline/components/timeline.tsx` |
| ファイルアップロード | `src/lib/multipart.ts` |

---

## 開発コマンド

> **Note**: monorepo 構成のため、実行するディレクトリに注意。
> ルート（`/`）から実行する場合は `pnpm native <command>` を使用。

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー起動（Expo、localhost:4002） |
| `pnpm start` | Expo 起動（デフォルトポート） |
| `pnpm ios` | iOS シミュレータで起動 |
| `pnpm android` | Android エミュレータで起動 |
| `pnpm typecheck` | 型チェック |
| `pnpm check` | Biome チェック |
| `pnpm check:fix` | Biome 自動修正 |
| `pnpm clean` | キャッシュクリア |

---

## 環境変数

### app.config.ts での設定

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `API_BASE_URL` | API エンドポイント URL（開発用） | Yes |
| `API_REMOTE_URL` | API エンドポイント URL（実機用） | No |
| `ENVIRONMENT` | 環境識別子 | No |
| `LOG_LEVEL` | ログレベル | No |

### 開発環境

環境変数は `.env` ファイルで設定（git 無視）。`app.config.ts` が `dotenv` で読み込む。

> **Note**: `.env` ファイルはセキュリティ上の理由から Claude Code では読み取れません。

### Android エミュレータ対応

`lib/env.ts` で `localhost` を自動的に `10.0.2.2` に変換（Android エミュレータ用）。

---

## 参考リンク

- [Expo 公式ドキュメント](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [HeroUI Native](https://heroui-native.com/) - MCP サーバー経由で情報取得を推奨
- [Uniwind](https://docs.uniwind.dev/)
- [Hono RPC](https://hono.dev/docs/guides/rpc)
- [react-hook-form](https://react-hook-form.com/)
