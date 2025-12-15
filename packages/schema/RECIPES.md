# Schema 実装レシピ集 (RECIPES.md)

## このファイルでわかること

具体的なコード例付きの実装パターン集。
基本的な流れは [README.md](./README.md) を参照。

> 最初から全部読む必要はありません。<br />
> 必要になったパターンだけ、その都度ここを見に来てください。

---

## 基本的なリソース追加

新しい「Todo」リソースのスキーマを追加する例。

### Step 1: ファイル作成

`src/{resource}.ts` を作成（リソース単位で1ファイル）

### Step 2: ベースモデル定義

ドメインモデルとなる基本スキーマを定義（`<Resource>Schema`）

### Step 3: Command/Query スキーマ定義

- **Command系**: 作成・更新・削除などの入出力（`<Action><Resource>InputSchema` 等）
- **Query系**: 取得・一覧などの出力（`Get<Resource>OutputSchema` 等）

### Step 4: 型エクスポート

`z.infer<typeof Schema>` で型を導出・エクスポート

### コード例

**ファイル作成** (`src/todo.ts`)

```typescript
import { z } from "@hono/zod-openapi";

/**
 * ベースモデル
 */
export const TodoSchema = z
  .object({
    id: z.uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    title: z.string().min(1).max(200).openapi({ example: "牛乳を買う" }),
    completed: z.boolean().openapi({ example: false }),
    createdAt: z.iso.datetime().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("Todo");

export type Todo = z.infer<typeof TodoSchema>;

/**
 * POST /todos - Todo作成
 */
export const CreateTodoInputSchema = z
  .object({
    title: z.string().min(1).max(200).openapi({ example: "牛乳を買う" }),
  })
  .openapi("CreateTodoInput");

export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;

export const CreateTodoOutputSchema = TodoSchema.openapi("CreateTodoOutput");
export type CreateTodoOutput = z.infer<typeof CreateTodoOutputSchema>;

/**
 * PATCH /todos/:id - Todo更新
 */
export const UpdateTodoInputSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    completed: z.boolean().optional(),
  })
  .openapi("UpdateTodoInput");

export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;

export const UpdateTodoOutputSchema = TodoSchema.openapi("UpdateTodoOutput");
export type UpdateTodoOutput = z.infer<typeof UpdateTodoOutputSchema>;

/**
 * GET /todos - Todo一覧
 */
export const GetTodosOutputSchema = z
  .array(TodoSchema)
  .openapi("GetTodosOutput");

export type GetTodosOutput = z.infer<typeof GetTodosOutputSchema>;
```

**ポイント**:
- Zod 4 の新記法（`z.uuid()`, `z.iso.datetime()` 等）を使用
- `.openapi()` でコンポーネント名と example を指定
- Input系は必要なフィールドのみ手動定義（バリデーションルールが異なるため）

---

## APIとの連携

### 使用箇所

| 場所 | 使用するもの | 目的 |
|------|-------------|------|
| `routes/*/route.ts` | `*Schema` | OpenAPI 仕様定義 |
| `routes/*/handlers.ts` | - | 型は route から推論 |
| `usecase/*` | `*Input`, `*Output` | 関数シグネチャ |
| `apps/web` | 型のみ | フォーム等の型定義 |

### API での使用例 (`apps/api/src/routes/todos/route.ts`)

```typescript
import { createRoute } from "@hono/zod-openapi";
import {
  CreateTodoInputSchema,
  CreateTodoOutputSchema,
} from "@packages/schema/todo";
import { DefaultErrorResponses } from "@/shared/error/error-openapi";

export const createTodoRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: { "application/json": { schema: CreateTodoInputSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: CreateTodoOutputSchema } },
      description: "Todo作成成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Todos"],
});
```

### usecase での使用例 (`apps/api/src/usecase/todos/create-todo.ts`)

```typescript
import type { DbClient } from "@packages/db";
import type { CreateTodoInput, CreateTodoOutput } from "@packages/schema/todo";

type CreateTodoDeps = { db: DbClient };

export const createTodo = async (
  deps: CreateTodoDeps,
  input: CreateTodoInput,
): Promise<CreateTodoOutput> => {
  // 実装...
};
```

---

## 既存スキーマの拡張

Zod のメソッドを使った拡張パターン。

### `.pick()` - 必要なフィールドのみ抽出

```typescript
// TodoSchema から title のみ抽出
export const CreateTodoInputSchema = TodoSchema
  .pick({ title: true })
  .openapi("CreateTodoInput");
```

### `.extend()` - フィールド追加

```typescript
// HealthSchema に database フィールドを追加
export const GetDbHealthOutputSchema = HealthSchema.extend({
  database: z.enum(["connected", "disconnected"]),
}).openapi("GetDbHealthOutput");
```

### `.partial()` - 全フィールドをオプショナルに

```typescript
// 部分更新用スキーマ
export const UpdateTodoInputSchema = TodoSchema
  .pick({ title: true, completed: true })
  .partial()
  .openapi("UpdateTodoInput");
```

### `.nullable()` - null 許容

```typescript
export const ProfileSchema = z.object({
  displayName: z.string().nullable(),  // string | null
  avatarUrl: z.url().nullable(),
}).openapi("Profile");
```

---

## ファイルアップロード

`multipart/form-data` でファイルを受け取るパターン。

### スキーマ定義 (`src/user.ts`)

```typescript
// z.custom<File> でファイル型を定義
export const UploadAvatarInputSchema = z
  .object({
    file: z
      .custom<File>((v) => v instanceof File)
      .openapi({
        type: "string",
        format: "binary",
        description: "アバター画像ファイル（JPEG/PNG/WebP、最大5MB）",
      }),
  })
  .openapi("UploadAvatarInput");

export type UploadAvatarInput = z.infer<typeof UploadAvatarInputSchema>;

export const UploadAvatarOutputSchema = z
  .object({
    avatarUrl: z.url(),
  })
  .openapi("UploadAvatarOutput");

export type UploadAvatarOutput = z.infer<typeof UploadAvatarOutputSchema>;
```

### ルート定義 (`apps/api/src/routes/user/route.ts`)

```typescript
export const uploadAvatarRoute = createRoute({
  method: "post",
  path: "/avatar",
  request: {
    body: {
      content: {
        "multipart/form-data": {  // ← content-type に注意
          schema: UploadAvatarInputSchema,
        },
      },
    },
  },
  responses: { ... },
});
```

**注意**: `tsconfig.json` に `"DOM"` ライブラリが必要（`File` 型のため）

---

## 他スキーマの参照

別ファイルのスキーマを組み合わせるパターン。

### 参照元 (`src/auth.ts`)

```typescript
export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  createdAt: z.iso.datetime(),
}).openapi("User");

export const ProfileSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  displayName: z.string().nullable(),
  avatarUrl: z.url().nullable(),
  createdAt: z.iso.datetime(),
}).openapi("Profile");
```

### 参照先 (`src/user.ts`)

```typescript
import { ProfileSchema, UserSchema } from "./auth";

// 複合スキーマ
export const GetMeOutputSchema = z
  .object({
    user: UserSchema,
    profile: ProfileSchema.nullable(),
  })
  .openapi("GetMeOutput");

export type GetMeOutput = z.infer<typeof GetMeOutputSchema>;
```

**ポイント**:
- ベースモデルは適切なファイルに集約
- 再利用可能なスキーマは積極的に参照
- `.nullable()` で null 許容にできる

---

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [README.md](./README.md) | パッケージ概要・命名規則 |
| [apps/api/README.md](../../apps/api/README.md) | API 実装の概要 |
| [apps/api/RECIPES.md](../../apps/api/RECIPES.md) | API 実装パターン集 |
