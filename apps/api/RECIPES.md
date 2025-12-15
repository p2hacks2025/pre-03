# API 実装レシピ集 (RECIPES.md)

## このファイルでわかること

具体的なコード例付きの実装パターン集。
基本的な流れは [README.md](./README.md) を参照。

> 最初から全部読む必要はありません。<br />
> 必要になったパターンだけ、その都度ここを見に来てください。

---

## APIエンドポイントの追加

「投稿取得 API」を例に説明します。

### Step 1: Schema + Route定義

まず API の入出力スキーマとルート定義を作成します。

**1-1. スキーマ作成** (`packages/schema/src/posts.ts`)

※ schema の詳細設計に関しては [Schema設計ガイド](../../packages/schema/README.md) を参照。

```typescript
import { z } from "@hono/zod-openapi";

// 入力スキーマ（パスパラメータ）
export const GetPostInputSchema = z.object({
  id: z.string().uuid(),
}).openapi("GetPostInput");

// 出力スキーマ
export const GetPostOutputSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
}).openapi("GetPostOutput");

// 型エクスポート（usecase で使用）
export type GetPostInput = z.infer<typeof GetPostInputSchema>;
export type GetPostOutput = z.infer<typeof GetPostOutputSchema>;
```

**1-2. ルート定義** (`src/routes/posts/route.ts`)

```typescript
import { createRoute } from "@hono/zod-openapi";
import { GetPostInputSchema, GetPostOutputSchema } from "@packages/schema/posts";
import { dbMiddleware } from "@/middleware/db";
import { DefaultErrorResponses } from "@/shared/error/error-openapi";

export const getPostRoute = createRoute({
  method: "get",
  path: "/:id",
  middleware: [dbMiddleware] as const,
  request: {
    params: GetPostInputSchema,  // schema を直接使用
  },
  responses: {
    200: {
      content: { "application/json": { schema: GetPostOutputSchema } },
      description: "投稿取得成功",
    },
    ...DefaultErrorResponses,
  },
  tags: ["Posts"],
});
```

---

### Step 2: Handler + Usecase実装

**2-1. ハンドラー** (`src/routes/posts/handlers.ts`)

```typescript
import type { AppRouteHandler } from "@/context";
import { getPost } from "@/usecase/posts";
import type { getPostRoute } from "./route";

export const getPostHandler: AppRouteHandler<typeof getPostRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const db = c.get("db");

  const result = await getPost({ db }, { id });
  return c.json(result);
};
```

**2-2. ユースケース** (`src/usecase/posts/get-post.ts`)

```typescript
import type { DbClient } from "@packages/db";
import type { GetPostInput, GetPostOutput } from "@packages/schema/posts";
import { getPostById } from "@/repository/post";
import { AppError } from "@/shared/error/app-error";

type GetPostDeps = { db: DbClient };

export const getPost = async (
  deps: GetPostDeps,
  input: GetPostInput,  // schema の型をそのまま使用
): Promise<GetPostOutput> => {
  const post = await getPostById(deps.db, input.id);

  if (!post) {
    throw new AppError("NOT_FOUND", { message: "投稿が見つかりません" });
  }

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
  };
};
```

**2-3. ルーターエクスポート** (`src/routes/posts/index.ts`)

```typescript
import { createRouter } from "@/config/router";
import { getPostHandler } from "./handlers";
import { getPostRoute } from "./route";

export const postsRouter = createRouter()
  .openapi(getPostRoute, getPostHandler);
```

**2-4. usecase の集約エクスポート** (`src/usecase/posts/index.ts`)

```typescript
export * from "./get-post";
```

---

### usecase の型共有パターン

**基本方針**: handler と usecase で input/output の型を共有する。schema の型（`z.infer<typeof Schema>`）は純粋な TypeScript 型なので、usecase で直接使用して問題ない。

**deps（依存）の定義**: usecase の第一引数 `deps` は各 usecase で独自に型定義する。handler から `c.get()` や `c.env` 経由で取得した依存を渡す：

```typescript
// usecase 側で deps 型を定義
type GetPostDeps = { db: DbClient };
type CreatePostDeps = { db: DbClient; supabase: SupabaseClient };

// handler から依存を渡す
const db = c.get("db");
const supabase = createSupabaseClient(c.env);
await createPost({ db, supabase }, input);
```

**拡張が必要なケース**:

認証情報など、handler でのみ取得できる値を usecase に渡す場合は型を拡張する：

```typescript
// handler
const input = c.req.valid("json");
const user = c.get("user");
await createPost({ db }, { ...input, authorId: user.id });

// usecase
type CreatePostUsecaseInput = CreatePostInput & { authorId: string };
```

**例外ケース**:

- **ファイルアップロード**: handler で `parseBody()` → `File` オブジェクトを取得し、usecase には `{ userId: string; file: File }` のような独自型を定義
- **部分的に使う場合**: `Pick<Input, "field1" | "field2">` で必要なフィールドのみ抽出

---

### Step 3: Repository追加（必要な場合）

DB 操作が必要な場合は repository を追加します。

**3-1. スキーマで型をエクスポート** (`@packages/db/src/schema/posts.ts`)

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 型をエクスポート
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

**3-2. リポジトリ関数** (`src/repository/post.ts`)

```typescript
import { type DbClient, type Post, type NewPost, eq, posts } from "@packages/db";

export const getPostById = async (
  db: DbClient,
  id: string,
): Promise<Post | null> => {
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  return result[0] ?? null;
};

export const createPost = async (
  db: DbClient,
  input: NewPost,
): Promise<Post> => {
  const result = await db.insert(posts).values(input).returning();
  return result[0];
};
```

**3-3. ルーターをマウント** (`src/routes/index.ts`)

```typescript
import { postsRouter } from "./posts";

export const routes = createRouter()
  .route("/", rootRouter)
  .route("/posts", postsRouter);  // 追加
```

**3-4. 型定義ビルド**

```bash
pnpm api build:types
```

---

## Middlewareの追加

ミドルウェアには「グローバル」と「ルート固有」の2種類があります。

### グローバルミドルウェア

全リクエストに適用されるミドルウェア（例: 環境変数パース、ロギング、CORS）

**実装例** (`src/middleware/rate-limit.ts`)

```typescript
import type { Context, Next } from "hono";
import type { Bindings, Variables } from "@/context";

export const rateLimitMiddleware = async (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next,
) => {
  // レートリミット処理
  // ...

  await next();
};
```

**登録方法** (`src/app.ts`)

```typescript
import { rateLimitMiddleware } from "@/middleware/rate-limit";

// グローバルミドルウェア（全ルートに適用）
app.use("*", envMiddleware);
app.use("*", loggerMiddleware);
app.use("*", rateLimitMiddleware);  // 追加
app.use("*", corsMiddleware);
```

### ルート固有ミドルウェア

特定のルートにのみ適用されるミドルウェア（例: 認証、DB接続）

**登録方法** (`src/routes/{domain}/route.ts`)

```typescript
import { authMiddleware } from "@/middleware/auth";
import { dbMiddleware } from "@/middleware/db";

export const protectedRoute = createRoute({
  method: "get",
  path: "/me",
  middleware: [authMiddleware, dbMiddleware] as const,  // ここで指定
  responses: { ... },
});
```

### 実装時の注意点

- **型定義**: `Context<{ Bindings: Bindings; Variables: Variables }>` を指定する
- **実行順序**: グローバルは登録順、ルート固有は配列順で実行される
- **エラー処理**: `AppError` を throw すると自動的に JSON レスポンスになる
- **Context への値設定**: `c.set("key", value)` で後続のハンドラーに値を渡せる

---

## 追加パターン

### Update 操作の実装

部分更新（PATCH）を実装するパターンです。

**1. スキーマで Update 用の型を定義** (`@packages/db/src/schema/profiles.ts`)

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 基本型
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

// Update 用型（更新可能なフィールドのみを Partial で定義）
export type ProfileUpdate = Partial<Pick<NewProfile, "displayName" | "avatarUrl">>;
```

**2. Repository で Update 関数を実装** (`src/repository/profile.ts`)

```typescript
import {
  type DbClient,
  type Profile,
  type ProfileUpdate,
  eq,
  profiles,
} from "@packages/db";

export const updateProfile = async (
  db: DbClient,
  userId: string,
  input: ProfileUpdate,
): Promise<Profile | null> => {
  // 更新するフィールドがない場合は現在のレコードを返す
  if (Object.keys(input).length === 0) {
    return getProfileByUserId(db, userId);
  }

  const result = await db
    .update(profiles)
    .set(input)
    .where(eq(profiles.userId, userId))
    .returning();

  return result[0] ?? null;
};
```

**ポイント**:
- Update 型は `Partial<Pick<NewProfile, "field1" | "field2">>` で定義
- 更新可能なフィールドを明示的に指定することで、意図しない更新を防止
- `id` や `createdAt` など不変フィールドは除外

---

### 認証ユーザーを usecase に渡すパターン

middleware で取得した認証情報を usecase に渡すパターンです。

**1. Handler で user を取得して渡す** (`src/routes/user/handlers.ts`)

```typescript
import type { AppRouteHandler } from "@/context";
import { getMe } from "@/usecase/user";
import type { getMeRoute } from "./route";

export const getMeHandler: AppRouteHandler<typeof getMeRoute> = async (c) => {
  const db = c.get("db");
  const user = c.get("user");  // authMiddleware で設定された user

  const result = await getMe({ db }, { user });
  return c.json(result);
};
```

**2. Usecase で独自の Input 型を定義** (`src/usecase/user/get-me.ts`)

```typescript
import type { DbClient } from "@packages/db";
import type { GetMeOutput } from "@packages/schema/user";
import type { User } from "@supabase/supabase-js";

type GetMeDeps = { db: DbClient };

// handler でのみ取得できる情報を含む Input
// schema に対応する型がないため、usecase 独自で定義
type GetMeInput = { user: User };

export const getMe = async (
  deps: GetMeDeps,
  input: GetMeInput,
): Promise<GetMeOutput> => {
  // input.user を使用してビジネスロジックを実行
  // ...
};
```

**ポイント**:
- Output 型は `@packages/schema` からインポート
- Input 型は schema に対応がない場合、usecase 内で独自定義
- `user: User` のように、Supabase の型を直接使用可能

---

### ファイルアップロードの実装

multipart/form-data でファイルを受け取るパターンです。

**1. Schema でファイル入力を定義** (`@packages/schema/user.ts`)

```typescript
import { z } from "@hono/zod-openapi";

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

export const UploadAvatarOutputSchema = z
  .object({
    avatarUrl: z.url(),
  })
  .openapi("UploadAvatarOutput");

export type UploadAvatarOutput = z.infer<typeof UploadAvatarOutputSchema>;
```

**2. Handler で parseBody() を使用** (`src/routes/user/handlers.ts`)

```typescript
import type { AppRouteHandler } from "@/context";
import { createSupabaseAdminClient } from "@/infrastructure/supabase";
import { uploadAvatar } from "@/usecase/user";
import { AppError } from "@/shared/error/app-error";
import type { uploadAvatarRoute } from "./route";

export const uploadAvatarHandler: AppRouteHandler<typeof uploadAvatarRoute> = async (c) => {
  // parseBody() で multipart/form-data を解析
  const body = await c.req.parseBody();
  const file = body.file;

  if (!file || !(file instanceof File)) {
    throw new AppError("BAD_REQUEST", { message: "ファイルが必須です" });
  }

  const user = c.get("user");
  const db = c.get("db");
  const supabaseAdmin = createSupabaseAdminClient(c.env);

  // usecase には userId と file を渡す
  const result = await uploadAvatar(
    { supabase: supabaseAdmin, db },
    { userId: user.id, file },
  );

  return c.json(result);
};
```

**3. Usecase で独自の Input 型を定義** (`src/usecase/user/upload-avatar.ts`)

```typescript
import type { DbClient } from "@packages/db";
import type { UploadAvatarOutput } from "@packages/schema/user";
import type { SupabaseClient } from "@supabase/supabase-js";

type UploadAvatarDeps = {
  supabase: SupabaseClient;
  db: DbClient;
};

// handler で parseBody() から取得した File を含む Input
// schema の UploadAvatarInput とは異なる（userId が追加されている）
type UploadAvatarInput = {
  userId: string;
  file: File;
};

export const uploadAvatar = async (
  deps: UploadAvatarDeps,
  input: UploadAvatarInput,
): Promise<UploadAvatarOutput> => {
  // ファイル検証、アップロード処理
  // ...
};
```

**ポイント**:
- Schema の Input 型は OpenAPI 仕様用（`file: File` のみ）
- Usecase の Input 型は handler から渡される情報を含む（`userId` + `file`）
- Output 型は共通で `@packages/schema` からインポート
- Storage 操作には `createSupabaseAdminClient`（SERVICE_ROLE_KEY）を使用
