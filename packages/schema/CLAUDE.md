# @packages/schema CLAUDE.md

API の入出力スキーマ定義を提供するパッケージ。Zod と @hono/zod-openapi を使用して、型安全なスキーマ定義と OpenAPI 仕様の自動生成を実現。

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [README.md](./README.md) | 概要・命名規則ガイドライン |
| [RECIPES.md](./RECIPES.md) | 具体的なコード例付きの実装パターン集 |

---

## 主要な特徴

| 特徴 | 説明 |
|------|------|
| Zod スキーマ | 型安全なバリデーション |
| @hono/zod-openapi | OpenAPI 仕様の自動生成 |
| 命名規則 | ドメイン（ユースケース）ベースの統一命名 |
| 型エクスポート | スキーマから導出した TypeScript 型定義 |

---

## ディレクトリ構造

```
packages/schema/
├── src/
│   ├── auth.ts           # 認証関連スキーマ（User, Profile, Session, Login, Signup等）
│   ├── user.ts           # ユーザー関連スキーマ（GetMe, UploadAvatar, UpdateProfile）
│   ├── health.ts         # ヘルスチェックスキーマ
│   └── common/
│       └── error.ts      # 共通エラーレスポンス
├── README.md             # 概要・命名規則ガイドライン
├── RECIPES.md            # 実装パターン集（コード例付き）
├── package.json
└── tsconfig.json         # "DOM" ライブラリ含む（File 型使用のため）
```

---

## 依存関係

### このパッケージの立ち位置

```
@packages/schema   ← 独立パッケージ（他の @packages/* に依存しない）
    ↑
    ├── apps/api（スキーマ定義を使用）
    └── apps/web（型定義を使用）
```

**特徴**:
- 他の `@packages/*` に依存しない
- `@packages/env`, `@packages/db` とは独立
- API と Web の両方から参照される共通スキーマ

### 外部依存

| パッケージ | 用途 |
|-----------|------|
| `@hono/zod-openapi` | OpenAPI 仕様生成・スキーマ拡張 |
| `zod` | スキーマバリデーション |

### 参照元

| パッケージ | 使用内容 |
|-----------|----------|
| `apps/api` | ルート定義でのスキーマ使用、OpenAPI 生成 |
| `apps/web` | 型定義として使用（フォーム等） |

---

## 命名規則

### 基本方針

**ドメイン（ユースケース）ベース**で命名。HTTP メソッドや DB 操作名は含めない。

### スキーマ命名パターン

| 種類 | パターン | 例 |
|------|----------|-----|
| ベースモデル | `<Resource>Schema` | `UserSchema`, `ProfileSchema` |
| Command入力 | `<Action><Resource>InputSchema` | `CreateUserInputSchema`, `LoginInputSchema` |
| Command出力 | `<Action><Resource>OutputSchema` | `CreateUserOutputSchema`, `LoginOutputSchema` |
| Query フィルタ | `<Resource>ListFilterSchema` | `UserListFilterSchema` |
| Query 出力 | `<Resource>ListOutputSchema` | `UserListOutputSchema` |
| ID パラメータ | `<Resource>IdSchema` | `UserIdSchema` |
| エラー | `<Resource>ErrorSchema` | `ErrorResponseSchema` |

### 型エイリアス

スキーマ名から `Schema` を取り除いた名前を使用。

```typescript
export const UserSchema = z.object({ ... }).openapi("User");
export type User = z.infer<typeof UserSchema>;
```

### 方針

- **ドメインベース**: HTTP メソッド名や DB 操作名は含めない
  - NG: `GetUserRequestSchema`, `PostUserSchema`, `SelectUserSchema`, `InsertUserSchema`
  - OK: `CreateUserInputSchema`, `SignupInputSchema`
- **ユースケース指向**: 操作を表す動詞を使う
  - 例: `Create`, `Update`, `Delete`, `Login`, `Signup`, `Upload`
- **明確な命名**: 曖昧な名前を避ける
  - NG: `UserRequestSchema`, `UserResponseSchema`
  - OK: `CreateUserInputSchema`, `UserListOutputSchema`

→ 詳細なコード例は [RECIPES.md](./RECIPES.md) を参照

---

## 主要ファイルの概要

### src/auth.ts

認証関連のスキーマ定義。

| 種類 | スキーマ |
|------|----------|
| ベースモデル | `UserSchema`, `ProfileSchema`, `SessionSchema` |
| Signup | `SignupInputSchema`, `SignupOutputSchema` |
| Login | `LoginInputSchema`, `LoginOutputSchema` |
| Logout | `LogoutOutputSchema` |
| Password Reset | `PasswordResetInputSchema`, `PasswordResetOutputSchema` |

### src/user.ts

ユーザー関連のスキーマ定義（auth.ts のベースモデルを参照）。

| 種類 | スキーマ |
|------|----------|
| GetMe | `GetMeOutputSchema` |
| Avatar Upload | `UploadAvatarInputSchema`, `UploadAvatarOutputSchema` |
| Profile Update | `UpdateProfileInputSchema` |

**注意**: `File` 型を使用するため、`tsconfig.json` に `"DOM"` ライブラリが必要。

### src/health.ts

ヘルスチェック用のスキーマ定義。

| 種類 | スキーマ |
|------|----------|
| ベースモデル | `HealthSchema` |
| Output | `GetHealthOutputSchema`, `GetDbHealthOutputSchema` |

### src/common/error.ts

共通エラーレスポンスのスキーマ定義。

| 種類 | スキーマ |
|------|----------|
| エラーコード | `ErrorCodeSchema` |
| エラー詳細 | `ErrorDetailSchema` |
| エラーレスポンス | `ErrorResponseSchema` |

→ 各ファイルの詳細なコード例は [RECIPES.md](./RECIPES.md) を参照

---

## 開発コマンド

| コマンド | 説明 |
|----------|------|
| `pnpm check` | Biome によるコード品質チェック |
| `pnpm check:fix` | Biome による自動修正 |
| `pnpm typecheck` | TypeScript 型チェック |

---

## @hono/zod-openapi との連携

| 項目 | 説明 |
|------|------|
| z のインポート | `import { z } from "@hono/zod-openapi"` |
| コンポーネント登録 | `.openapi("ComponentName")` で OpenAPI スキーマに登録 |
| パラメータ定義 | `.openapi({ param: { name, in } })` でパスパラメータ等を定義 |
| example 追加 | `.openapi({ example: "value" })` で例を追加 |

→ 詳細なコード例は [RECIPES.md](./RECIPES.md) を参照

---

## Zod 4 新記法

Zod 4 で追加されたショートハンドメソッドを使用。

| 旧記法 | 新記法 | 説明 |
|--------|--------|------|
| `z.string().uuid()` | `z.uuid()` | UUID |
| `z.string().email()` | `z.email()` | メールアドレス |
| `z.string().url()` | `z.url()` | URL |
| `z.string().datetime()` | `z.iso.datetime()` | ISO 8601 日時 |
| `z.string().date()` | `z.iso.date()` | ISO 8601 日付 |

**注意**: `@hono/zod-openapi` 経由で `z` をインポートすると、これらの新記法が使用可能。
