# Database Guide (packages/db)

## このファイルでわかること

- パッケージの役割とディレクトリ構造
- Drizzle ORM スキーマ定義の書き方
- 新しいテーブルを追加するときの基本的な流れ

## ディレクトリ構造

```
src/
├── index.ts           # エクスポート統合
├── client.ts          # DBクライアント初期化
├── schema/
│   ├── index.ts       # スキーマ統合エクスポート
│   ├── {table}.ts     # テーブル定義
│   └── relations.ts   # リレーション定義
└── seed/
    └── seeders/       # シーダー実装
```

- 🟢: よく触る想定
- 🟡: 特定の変更のときだけ
- 🚫: 基本的に触らない

| ファイル/ディレクトリ | 役割 | 触る頻度 |
|---------------------|------|---------|
| `src/schema/{table}.ts` | テーブル定義 | 🟢 テーブル追加時 |
| `src/schema/index.ts` | スキーマエクスポート | 🟢 テーブル追加時 |
| `src/schema/relations.ts` | リレーション定義 | 🟡 FK追加時 |
| `src/seed/seeders/` | シーダー実装 | 🟡 テストデータ追加時 |
| `src/client.ts` | DBクライアント初期化 | 🚫 稀 |
| `drizzle.config.ts` | Drizzle Kit 設定 | 🚫 稀 |

---

## エクスポートされる機能

`@packages/db` から以下がインポート可能です。

| 種類 | エクスポート | 用途 |
|------|-------------|------|
| DBクライアント | `createDbClient`, `DbClient` | DB接続・型定義 |
| テーブル | `profiles`, `authUsers` など | クエリ対象 |
| 型 | `Profile`, `NewProfile`, `ProfileUpdate` など | 型安全な操作 |
| Drizzle ユーティリティ | `eq`, `and`, `or`, `not`, `sql` | WHERE句・条件式 |

```typescript
// 使用例
import {
  type DbClient,
  eq,
  type NewProfile,
  type Profile,
  type ProfileUpdate,
  profiles,
} from "@packages/db";
```

---

## Drizzle ORM スキーマ定義ガイド

### カラム型

`drizzle-orm/pg-core` からインポートして使用します。

```typescript
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
```

| 関数 | PostgreSQL 型 | 用途 |
|------|---------------|------|
| `uuid("col")` | `UUID` | 一意識別子 |
| `text("col")` | `TEXT` | 可変長文字列 |
| `integer("col")` | `INTEGER` | 整数 |
| `boolean("col")` | `BOOLEAN` | 真偽値 |
| `timestamp("col")` | `TIMESTAMP` | 日時 |
| `jsonb("col")` | `JSONB` | JSON データ |

### 主キー

```typescript
// UUID を主キーに（自動生成）
id: uuid("id").primaryKey().defaultRandom()

// 連番を主キーに
id: integer("id").primaryKey().generatedAlwaysAsIdentity()
```

### 複合主キー

中間テーブルなど、複数カラムで主キーを構成する場合：

```typescript
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

export const usersToGroups = pgTable(
  "users_to_groups",
  {
    userId: uuid("user_id").notNull(),
    groupId: uuid("group_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.groupId] })]
);
```

### 外部キー

```typescript
import { authUsers } from "drizzle-orm/supabase";

// 基本的な外部キー
userId: uuid("user_id").references(() => authUsers.id)

// オプション付き（削除時の動作指定）
userId: uuid("user_id")
  .notNull()
  .references(() => authUsers.id, { onDelete: "cascade" })
```

| オプション | 説明 |
|-----------|------|
| `cascade` | 親削除時に子も削除 |
| `set null` | 親削除時に NULL に |
| `restrict` | 参照があれば削除拒否 |
| `no action` | 何もしない（デフォルト） |

### 制約

```typescript
// NOT NULL
displayName: text("display_name").notNull()

// ユニーク制約
email: text("email").notNull().unique()

// デフォルト値
createdAt: timestamp("created_at").notNull().defaultNow()
isActive: boolean("is_active").notNull().default(true)
```

### インデックス

検索パフォーマンス向上のためのインデックス定義：

```typescript
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id").notNull(),
    title: text("title").notNull(),
  },
  (t) => [index("posts_author_idx").on(t.authorId)]
);
```

### 型エクスポート

各テーブル定義に型をエクスポートします。

```typescript
export const profiles = pgTable("profiles", { ... });

// SELECT 結果用（全カラム含む）
export type Profile = typeof profiles.$inferSelect;

// INSERT 入力用（デフォルト値があるカラムはオプショナル）
export type NewProfile = typeof profiles.$inferInsert;

// UPDATE 用（更新可能なフィールドのみ、すべてオプショナル）
export type ProfileUpdate = Partial<
  Pick<NewProfile, "displayName" | "avatarUrl">
>;
```

**型の使い分け**:
| 型 | 用途 | 特徴 |
|----|------|------|
| `$inferSelect` | SELECT 結果 | 全カラム必須 |
| `$inferInsert` | INSERT 入力 | デフォルトありはオプショナル |
| `Partial<Pick<>>` | UPDATE 入力 | 更新可能フィールドのみ、すべてオプショナル |

---

## 新規実装時の基本的な流れ

### 新しいテーブルの追加

| Step | 作業内容 | 対象ファイル |
|------|---------|-------------|
| 1 | スキーマファイル作成 | `src/schema/{table}.ts` |
| 2 | 型エクスポート定義 | 同上 |
| 3 | index.ts でエクスポート | `src/schema/index.ts` |
| 4 | リレーション定義（必要時） | `src/schema/relations.ts` |
| 5 | マイグレーション生成 | `pnpm db:generate` |
| 6 | マイグレーション適用 | `pnpm db:migrate` |
| 7 | Repository 実装（API側） | `apps/api/src/repository/` |

→ 詳細な実装例は [RECIPES.md](./RECIPES.md) を参照

### API側での使用（Repository層）

Repository は `apps/api/src/repository/` に配置します。

```
@packages/db からインポート（型、テーブル、ユーティリティ）
    ↓
repository/{entity}.ts を作成
    ↓
DbClient を第1引数で受け取る関数を定義
    ↓
usecase から呼び出し
```

→ 詳細な Repository 実装パターンは [RECIPES.md](./RECIPES.md#repository-実装パターン) を参照

---

## コマンド一覧

### スキーマ・マイグレーション

| コマンド | 説明 |
|----------|------|
| `pnpm db:generate` | マイグレーションファイル生成 |
| `pnpm db:migrate` | マイグレーション適用 |
| `pnpm db:push` | スキーマを直接プッシュ（開発用） |
| `pnpm db:studio` | Drizzle Studio（GUI管理ツール）起動 |

### シード機能

| コマンド | 説明 |
|----------|------|
| `pnpm db:seed` | シード実行（追記モード） |
| `pnpm db:seed --force` | シード実行（上書きモード） |
| `pnpm db:seed --reset` | リセット後シード実行 |

→ シーダーの追加方法は [CLAUDE.md](./CLAUDE.md#新しいシーダーの追加方法) を参照

---

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [RECIPES.md](./RECIPES.md) | 具体的なコード例付きの実装パターン集 |
| [apps/api/README.md](../../apps/api/README.md) | API 実装ガイド |
| [apps/api/RECIPES.md](../../apps/api/RECIPES.md) | API 実装パターン集 |
