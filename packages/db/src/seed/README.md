# Seed機能

環境初期化のためのシード機能。以下の2種類のシーダーを管理します。

## シーダーの種類

### Infrastructure Seeders（インフラ初期化）

環境に必要なインフラ設定を行う。冪等性あり（既存ならスキップ）。

| シーダー | 役割 |
|---------|------|
| `storageSeeder` | Supabase Storage バケット作成 |

### Data Seeders（データ初期化）

テスト・開発用の初期データを投入する。

| シーダー | 役割 |
|---------|------|
| `usersSeeder` | テストユーザー作成、プロフィール初期化 |

### 実行順序

1. Infrastructure Seeders（他のシーダーが依存する可能性があるため先に実行）
2. Data Seeders

---

## ディレクトリ構造

```
seed/
├── index.ts          # エントリポイント（CLI引数解析）
├── runner.ts         # シード実行エンジン
├── seeders/          # シーダー実装
│   ├── index.ts      # Seederインターフェース定義
│   ├── storage.ts    # [Infrastructure] Storageバケット・RLS設定
│   └── users.ts      # [Data] テストユーザー作成
└── utils/
    └── reset.ts      # リセット用ユーティリティ
```

## コマンド

```bash
# 通常実行（既存データはスキップ）
pnpm db:seed

# 強制反映（既存データを削除して再作成）
pnpm db:seed --force   # または -f

# 全リセット後にシード実行
pnpm db:seed --reset   # または -r
pnpm db:seed:reset     # ショートカット
```

## 新しいシーダーの追加方法

### 1. シーダーファイルを作成

`seeders/`ディレクトリに新しいファイルを作成します。

```typescript
// seeders/organizations.ts
import { organizations } from "../../schema";
import type { Seeder } from "./index";

const TEST_ORGANIZATIONS = [
  { name: "Acme Corp", slug: "acme" },
  { name: "Example Inc", slug: "example" },
];

export const organizationsSeeder: Seeder = {
  name: "organizations",

  // リセット処理（--force, --reset時に実行）
  async reset(ctx) {
    console.log("Resetting organizations...");
    await ctx.db.delete(organizations);
    console.log("Organizations deleted");
  },

  // シード処理
  async seed(ctx) {
    console.log("Seeding organizations...");

    for (const org of TEST_ORGANIZATIONS) {
      await ctx.db.insert(organizations).values(org);
      console.log(`Created organization: ${org.name}`);
    }
  },
};
```

### 2. index.tsに登録

`index.ts`のseeders配列に追加します。

```typescript
// index.ts
import { usersSeeder } from "./seeders/users";
import { organizationsSeeder } from "./seeders/organizations";

// 実行順序に注意（依存関係がある場合）
const seeders = [usersSeeder, organizationsSeeder];
```

## Seederインターフェース

```typescript
interface Seeder {
  name: string;                              // シーダー名（ログ出力用）
  seed(ctx: SeedContext): Promise<void>;     // シード処理（必須）
  reset?(ctx: SeedContext): Promise<void>;   // リセット処理（オプション）
}

interface SeedContext {
  db: DbClient;                   // Drizzle DBクライアント
  adminSupabase: SupabaseClient;  // Supabase管理者クライアント
  options: SeedOptions;           // CLIオプション
}

interface SeedOptions {
  force: boolean;   // --force フラグ
  reset: boolean;   // --reset フラグ
}
```

## 実行フロー

```
pnpm db:seed --reset
    │
    ▼
┌─────────────────────────┐
│  CLIフラグ解析          │
│  (index.ts)             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  環境変数検証           │
│  - SUPABASE_URL         │
│  - SUPABASE_SERVICE_KEY │
│  - DATABASE_URL         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  リセットフェーズ       │  ← --force または --reset 時のみ
│  (各seeder.reset())     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  シードフェーズ         │
│  (各seeder.seed())      │
└─────────────────────────┘
```

## 注意事項

### 実行順序

シーダーは配列の順番で実行されます。外部キー制約がある場合は依存先を先に実行してください。

```typescript
// 正しい順序（usersが先）
const seeders = [usersSeeder, profilesSeeder, postsSeeder];
```

### リセット時のCASCADE

`profiles`テーブルは`auth.users`にCASCADE削除が設定されています。
`usersSeeder.reset()`で`auth.users`を削除すると、`profiles`も自動削除されます。

### 重複チェック

既存データとの重複を適切に処理してください。

```typescript
// パターン1: エラーをスキップ
if (error?.message.includes("already exists")) {
  console.log(`${item.name} already exists, skipping...`);
  continue;
}

// パターン2: upsert（存在すれば更新）
await ctx.db
  .insert(table)
  .values(data)
  .onConflictDoUpdate({ target: table.id, set: data });
```

## 環境変数

シード実行に必要な環境変数:

| 変数名 | 説明 |
|--------|------|
| `SUPABASE_URL` | SupabaseプロジェクトURL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスロールキー（管理者権限） |
| `DATABASE_URL` | PostgreSQL接続文字列 |
