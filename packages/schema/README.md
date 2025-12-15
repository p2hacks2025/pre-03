# @packages/schema

## このファイルでわかること

- `@packages/schema` の役割と設計思想
- 新しいリソースのスキーマを追加する手順
- API（`apps/api`）との連携パターン

---

## パッケージ概要

API の入出力スキーマ定義を提供する共通パッケージ。

| 特徴 | 説明 |
|------|------|
| Zod スキーマ | 型安全なバリデーション |
| OpenAPI 連携 | `@hono/zod-openapi` による仕様自動生成 |
| 共有型定義 | API と Web で型を共有 |

### 依存関係

```
@packages/schema   ← 独立パッケージ（他の @packages/* に依存しない）
    ↑
    ├── apps/api（スキーマ定義を使用）
    └── apps/web, apps/native（型定義を使用）
```

---

## ディレクトリ構造

```
packages/schema/src/
├── {resource}.ts  # リソース別スキーマ定義
└── common/
    └── error.ts    # 共通エラーレスポンス
```

| ファイル | 役割 | 触る頻度 |
|---------|------|---------|
| `src/{resource}.ts` | リソース別スキーマ定義 | 🟢 API実装時 |
| `src/common/error.ts` | 共通エラースキーマ | 🟡 エラー追加時 |

---

## 新規スキーマ追加の流れ

新しいリソース（例: Todo）のスキーマを追加する手順。

### Step 1: ファイル作成

`src/{resource}.ts` を作成（リソース単位で1ファイル）

### Step 2: ベースモデル定義

ドメインモデルとなる基本スキーマを定義（`<Resource>Schema`）

### Step 3: Command/Query スキーマ定義

- **Command系**: 作成・更新・削除などの入出力（`<Action><Resource>InputSchema` 等）
- **Query系**: 取得・一覧などの出力（`Get<Resource>OutputSchema` 等）

### Step 4: 型エクスポート

`z.infer<typeof Schema>` で型を導出・エクスポート

→ 具体的なコード例は [RECIPES.md](./RECIPES.md#基本的なリソース追加) を参照

---

## 命名規則

### 基本ルール

| 種類 | スキーマ名 | 型名 | 例 |
|------|-----------|------|-----|
| ベースモデル | `<Resource>Schema` | `<Resource>` | `UserSchema` → `User` |
| Command入力 | `<Action><Resource>InputSchema` | `<Action><Resource>Input` | `CreateTodoInputSchema` → `CreateTodoInput` |
| Command出力 | `<Action><Resource>OutputSchema` | `<Action><Resource>Output` | `LoginOutputSchema` → `LoginOutput` |
| Query出力 | `Get<Resource>OutputSchema` | `Get<Resource>Output` | `GetMeOutputSchema` → `GetMeOutput` |
| 一覧出力 | `<Resource>ListOutputSchema` | `<Resource>ListOutput` | `TodoListOutputSchema` → `TodoListOutput` |

### 方針

- **ドメインベース**: HTTP メソッド名や DB 操作名は含めない
  - NG: `PostUserSchema`, `InsertUserSchema`
  - OK: `CreateUserInputSchema`, `SignupInputSchema`
- **ユースケース指向**: 操作を表す動詞を使う
  - 例: `Create`, `Update`, `Delete`, `Login`, `Signup`, `Upload`

### 具体例

```typescript
// ベースモデル
export const TodoSchema = z.object({ ... }).openapi("Todo");
export type Todo = z.infer<typeof TodoSchema>;

// Command系（作成）
export const CreateTodoInputSchema = TodoSchema.pick({ title: true }).openapi("CreateTodoInput");
export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;

// Query系（取得）
export const GetTodosOutputSchema = z.array(TodoSchema).openapi("GetTodosOutput");
export type GetTodosOutput = z.infer<typeof GetTodosOutputSchema>;
```

---

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [RECIPES.md](./RECIPES.md) | スキーマ実装パターン集 |
| [apps/api/README.md](../../apps/api/README.md) | API 実装の概要 |
| [apps/api/RECIPES.md](../../apps/api/RECIPES.md) | API 実装パターン集 |
