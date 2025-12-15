# Native App Guide (apps/native)

## このファイルでわかること

- プロジェクトのディレクトリ構造
- 新しい画面やコンポーネントを追加するときの基本的な流れ
- どこを触っていいか/悪いかの判断基準

## 主要技術

| 技術 | バージョン |
|------|-----------|
| React Native | 0.81.5 |
| Expo | ~54 |
| Expo Router | ~6 |
| HeroUI Native | 1.0.0-beta |
| Uniwind (TailwindCSS) | ^1.2.2 |

## ディレクトリ構造

`app/ → screens/ → features/` の Feature + Screen 分離型構造

```
apps/native/
├── app/                          # Expo Router（ルーティング層）
│   ├── _layout.tsx               # ルートレイアウト
│   ├── ({group})/                # ルートグループ
│   │   ├── _layout.tsx           # グループレイアウト
│   │   └── {route}.tsx           # ルート定義
│   └── ...
├── src/
│   ├── screens/                  # 画面コンポーネント
│   ├── modals/                   # モーダルコンポーネント
│   ├── features/                 # 機能単位のUI・ロジック
│   ├── components/               # 汎用コンポーネント
│   │   ├── ui/                   # 基本UI部品
│   │   └── common/               # 共有コンポーネント
│   ├── contexts/                 # グローバル Context
│   ├── hooks/                    # グローバルフック
│   ├── lib/                      # ユーティリティ
│   └── globals.css                # グローバルスタイル
└── assets/                       # 画像・フォント
```

- 🟢: よく触る想定
- 🟡: 特定の変更のときだけ
- 🚫: 基本的に触らなくてよい（困ったら相談）

| ファイル/ディレクトリ | 役割 | 触る頻度 |
|---------------------|------|---------|
| `app/({group})/{route}.tsx` | ルート定義 | 🟡 ルート追加時 |
| `src/screens/` | 画面コンポーネント | 🟢 画面実装 |
| `src/modals/` | モーダルコンポーネント | 🟢 モーダル実装 |
| `src/features/{feature}/` | 機能単位のUI・ロジック | 🟢 機能実装 |
| `src/components/ui/` | 汎用UIコンポーネント | 🟡 UI追加時 |
| `src/components/common/` | 共有コンポーネント | 🟡 共有化時 |
| `src/contexts/` | グローバル Context | 🚫 稀 |
| `src/lib/` | ユーティリティ | 🚫 稀 |
| `app/_layout.tsx` | ルートレイアウト | 🚫 稀 |

## 共通 package

| パッケージ | 役割 | 触る頻度 |
|-----------|------|---------|
| `@packages/schema` | Zod スキーマ定義（フォームバリデーション、型） | 🚫 バックエンド定義 |
| `@packages/api-contract` | Hono RPC クライアント生成 | 🚫 自動生成 |
| `@packages/env` | 環境変数の型定義・バリデーション | 🟡 環境変数追加時 |

---

## 新規実装時の基本的な流れ

### 画面の追加

1. `src/screens/{screen}/` に画面コンポーネントを作成
2. `app/({group})/` にルートファイルを追加
3. ルートファイルから Screen を re-export

```tsx
// app/({group})/{route}.tsx
export { SomeScreen as default } from "@/screens/{screen}/{screen}-screen";
```

→ 詳細な実装例は [RECIPES.md](./RECIPES.md#画面の追加) を参照

### モーダルの追加

1. `src/modals/` にモーダルコンポーネントを作成
2. `app/` 配下の適切なグループにルートファイルを追加
3. ルートファイルから Modal を re-export

→ 詳細な実装例は [RECIPES.md](./RECIPES.md#モーダルの追加) を参照

### 機能（Feature）の追加

1. `src/features/{feature}/` にディレクトリを作成
2. `components/` にUI部品を配置
3. `hooks/` にカスタムフックを配置
4. `lib/` にバリデーション等を配置
5. `index.ts` で barrel export

```
src/features/{feature}/
├── components/
│   └── index.ts
├── hooks/
├── lib/
└── index.ts
```

→ 詳細な実装例は [RECIPES.md](./RECIPES.md#機能の追加) を参照

### UIコンポーネントの追加

1. `src/components/ui/` に汎用コンポーネントを作成
2. `index.ts` で export

→ 詳細な実装例は [RECIPES.md](./RECIPES.md#UIコンポーネントの追加) を参照

### フォーム機能の追加

1. `@packages/schema` のスキーマを使用（または `features/{feature}/lib/` で定義）
2. `react-hook-form` + `@hookform/resolvers/zod` でフォーム状態管理
3. `features/{feature}/components/` にフォームコンポーネントを配置

→ 詳細な実装例は [RECIPES.md](./RECIPES.md#フォーム機能の追加) を参照
