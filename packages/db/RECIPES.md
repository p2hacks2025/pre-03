# Database 実装レシピ集 (RECIPES.md)

## このファイルでわかること

具体的なコード例付きの実装パターン集。
基本的な流れは [README.md](./README.md) を参照。

> 最初から全部読む必要はありません。<br />
> 必要になったパターンだけ、その都度ここを見に来てください。

---

## 新しいテーブルの追加

「投稿（posts）」テーブルを例に、追加手順を説明します。

### Step 1: スキーマファイル作成

`src/schema/{table}.ts` を作成します。

```typescript
// src/schema/posts.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

### Step 2: 型エクスポート定義

同じファイルに型を追加します。

```typescript
// src/schema/posts.ts（続き）

// SELECT 結果用
export type Post = typeof posts.$inferSelect;

// INSERT 入力用
export type NewPost = typeof posts.$inferInsert;
```

### Step 3: Update 用型定義

更新可能なフィールドのみを許可する型を定義します。

```typescript
// src/schema/posts.ts（続き）

// 更新可能なフィールドのみ許可（id, createdAt は更新不可）
export type PostUpdate = Partial<Pick<NewPost, "title" | "content">>;
```

**ポイント**:
- `Partial<Pick<>>` で更新可能なフィールドを明示
- `id` や `createdAt` など不変フィールドは除外

### Step 4: index.ts でエクスポート

```typescript
// src/schema/index.ts
export * from "./auth";
export * from "./profiles";
export * from "./posts";      // 追加
export * from "./relations";
```

### Step 5: リレーション定義（必要時）

外部キーがある場合は、リレーションを定義します。

```typescript
// src/schema/relations.ts に追加
import { posts } from "./posts";
import { profiles } from "./profiles";

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(profiles, {
    fields: [posts.authorId],
    references: [profiles.id],
  }),
}));
```

### Step 6: マイグレーション生成・適用

```bash
# マイグレーションファイル生成
pnpm db:generate

# ローカル DB に適用
pnpm db:migrate
```

---

## テーブル定義パターン

### 基本的なテーブル定義

最小構成のテーブル定義です。

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

### 外部キー参照（Supabase auth.users）

Supabase の認証テーブルを参照するパターンです。

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
```

**ポイント**:
- `authUsers` は `drizzle-orm/supabase` からインポート
- `onDelete: "cascade"` でユーザー削除時にプロフィールも削除

### リレーション定義

テーブル間のリレーションを定義します（Drizzle Query API 用）。

```typescript
import { relations } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { profiles } from "./profiles";

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(authUsers, {
    fields: [profiles.userId],
    references: [authUsers.id],
  }),
}));
```

---

## Repository 実装パターン

Repository は `apps/api/src/repository/` に配置します。
以下は `@packages/db` を使用した典型的なパターンです。

### インポートパターン

```typescript
import {
  type DbClient,
  eq,
  type NewProfile,
  type Profile,
  type ProfileUpdate,
  profiles,
} from "@packages/db";
```

### 単一レコード取得

```typescript
export const getProfileByUserId = async (
  db: DbClient,
  userId: string,
): Promise<Profile | null> => {
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return result[0] ?? null;
};
```

**ポイント**:
- `limit(1)` で 1 件に絞る
- 結果は配列なので `result[0] ?? null` で取り出す

### レコード作成

```typescript
export const createProfile = async (
  db: DbClient,
  input: NewProfile,
): Promise<Profile> => {
  const result = await db.insert(profiles).values(input).returning();

  return result[0];
};
```

**ポイント**:
- `NewProfile` 型で入力を受け取る
- `.returning()` で作成したレコードを返す

### レコード更新（部分更新）

```typescript
export const updateProfile = async (
  db: DbClient,
  userId: string,
  input: ProfileUpdate,
): Promise<Profile | null> => {
  // 更新するフィールドがない場合は現在のプロフィールを返す
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
- `ProfileUpdate` 型（`Partial<Pick<>>`）で入力を受け取る
- 空の更新は早期リターン
- `.returning()` で更新後のレコードを返す

### レコード削除

```typescript
export const deleteProfile = async (
  db: DbClient,
  userId: string,
): Promise<void> => {
  await db
    .delete(profiles)
    .where(eq(profiles.userId, userId));
};
```

### 複数条件での検索

```typescript
import { and, eq, or } from "@packages/db";

export const searchProfiles = async (
  db: DbClient,
  options: { userId?: string; displayName?: string },
): Promise<Profile[]> => {
  const conditions = [];

  if (options.userId) {
    conditions.push(eq(profiles.userId, options.userId));
  }
  if (options.displayName) {
    conditions.push(eq(profiles.displayName, options.displayName));
  }

  if (conditions.length === 0) {
    return db.select().from(profiles);
  }

  return db
    .select()
    .from(profiles)
    .where(and(...conditions));
};
```

---

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [README.md](./README.md) | パッケージ概要・スキーマ定義ガイド |
| [apps/api/README.md](../../apps/api/README.md) | API 実装の概要 |
| [apps/api/RECIPES.md](../../apps/api/RECIPES.md) | API 実装パターン集 |
