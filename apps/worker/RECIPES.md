# Worker 実装レシピ集 (RECIPES.md)

## このファイルでわかること

具体的なコード例付きの実装パターン集。
基本的な流れは [README.md](./README.md) を参照。

> 最初から全部読む必要はありません。<br />
> 必要になったパターンだけ、その都度ここを見に来てください。

---

## ジョブの追加

「データ同期ジョブ」を例に説明します。

### Step 1: タスクの作成

まずジョブで使用するタスクを作成します。

**1-1. 個別タスクの実装** (`src/tasks/sync-users.ts`)

```typescript
import type { WorkerContext } from "@/lib";

export type SyncUsersResult = {
  status: "ok" | "error";
  syncedCount: number;
  message: string;
};

/**
 * ユーザーデータを同期するタスク
 */
export const syncUsers = async (
  ctx: WorkerContext,
): Promise<SyncUsersResult> => {
  const start = Date.now();
  try {
    // DB からユーザーを取得
    const users = await ctx.db.query.users.findMany();

    // 同期処理を実行
    // ...

    const latencyMs = Date.now() - start;
    ctx.logger.info("Users synced", { count: users.length, latencyMs });

    return {
      status: "ok",
      syncedCount: users.length,
      message: `Synced ${users.length} users`,
    };
  } catch (error) {
    ctx.logger.error("User sync failed", {}, error as Error);
    return {
      status: "error",
      syncedCount: 0,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
```

**1-2. タスクのエクスポート** (`src/tasks/index.ts`)

```typescript
export { checkDb, checkSupabase, type HealthCheckResult } from "./health";
export { syncUsers, type SyncUsersResult } from "./sync-users";  // 追加
```

---

### Step 2: ジョブの作成

複数タスクをまとめるジョブを作成します。

**2-1. ジョブの実装** (`src/jobs/data-sync.ts`)

```typescript
import type { WorkerContext } from "@/lib";
import { syncUsers, type SyncUsersResult } from "@/tasks";

export type DataSyncJobResult = {
  success: boolean;
  results: {
    users: SyncUsersResult;
  };
};

/**
 * データ同期ジョブ
 */
export const dataSync = async (
  ctx: WorkerContext,
): Promise<DataSyncJobResult> => {
  ctx.logger.info("=== Starting data-sync job ===");

  const usersResult = await syncUsers(ctx);

  const success = usersResult.status === "ok";

  if (success) {
    ctx.logger.info("=== data-sync job completed: SUCCESS ===");
  } else {
    ctx.logger.warn("=== data-sync job completed: FAILED ===");
  }

  return {
    success,
    results: {
      users: usersResult,
    },
  };
};
```

**2-2. ジョブの登録** (`src/jobs/index.ts`)

```typescript
import type { WorkerContext } from "@/lib";
import { healthCheck } from "./health-check";
import { dataSync } from "./data-sync";  // 追加

export const jobs = {
  "health-check": healthCheck,
  "data-sync": dataSync,  // 追加
} as const satisfies Record<string, (ctx: WorkerContext) => Promise<unknown>>;

export type JobName = keyof typeof jobs;
```

---

### Step 3: スケジュールの追加（オプション）

定期実行が必要な場合は `daemon.ts` にスケジュールを追加します。

**3-1. スケジュール登録** (`src/daemon.ts`)

```typescript
import cron from "node-cron";
import { jobs } from "@/jobs";
import { getContext } from "@/lib";

// スケジュール定義
const schedules = [
  { name: "health-check", cron: "* * * * *", job: jobs["health-check"] },
  // 毎日深夜3時にデータ同期
  { name: "data-sync", cron: "0 3 * * *", job: jobs["data-sync"] },  // 追加
] as const;

// 以下は既存のまま
```

**cron 式の書き方**:

| 式 | 意味 |
|---|------|
| `* * * * *` | 毎分 |
| `0 * * * *` | 毎時0分 |
| `0 3 * * *` | 毎日3:00 |
| `0 0 * * 0` | 毎週日曜0:00 |
| `0 0 1 * *` | 毎月1日0:00 |

---

## タスクの追加

ジョブを作らず、タスクのみ追加するパターンです。

### シンプルなタスク

**1. タスクの実装** (`src/tasks/cleanup-temp.ts`)

```typescript
import type { WorkerContext } from "@/lib";

export type CleanupResult = {
  status: "ok" | "error";
  deletedCount: number;
};

/**
 * 一時ファイルを削除するタスク
 */
export const cleanupTemp = async (
  ctx: WorkerContext,
): Promise<CleanupResult> => {
  try {
    // 削除処理
    const deletedCount = 0; // 実際の削除件数

    ctx.logger.info("Cleanup completed", { deletedCount });
    return { status: "ok", deletedCount };
  } catch (error) {
    ctx.logger.error("Cleanup failed", {}, error as Error);
    return { status: "error", deletedCount: 0 };
  }
};
```

**2. エクスポート** (`src/tasks/index.ts`)

```typescript
export { cleanupTemp, type CleanupResult } from "./cleanup-temp";
```

**3. 既存ジョブ内で呼び出し**

```typescript
// jobs/maintenance.ts
import { cleanupTemp } from "@/tasks";

export const maintenance = async (ctx: WorkerContext) => {
  // 他のタスクと組み合わせ
  const cleanupResult = await cleanupTemp(ctx);
  // ...
};
```

---

## WorkerContext の拡張

新しい依存（外部サービスなど）を追加するパターンです。

### Step 1: 環境変数の追加

**1-1. @packages/env に追加** (`packages/env/src/worker-keys.ts`)

```typescript
import { z } from "zod";
import { dbKeys } from "./db-keys";

export const workerKeys = {
  ...dbKeys,
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  // 新しい環境変数を追加
  EXTERNAL_API_URL: z.url(),
  EXTERNAL_API_KEY: z.string().min(1),
};
```

### Step 2: Context に追加

**2-1. クライアント生成と Context 更新** (`src/lib/context.ts`)

```typescript
import { createDbClient, type DbClient } from "@packages/db";
import { createLogger, type Logger } from "@packages/logger";
import { createClient } from "@supabase/supabase-js";
import { type Env, env } from "./env";

// 外部 API クライアントの型（仮）
type ExternalApiClient = {
  fetch: (path: string) => Promise<Response>;
};

const createExternalApiClient = (baseUrl: string, apiKey: string): ExternalApiClient => ({
  fetch: (path) =>
    fetch(`${baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    }),
});

export type WorkerContext = {
  db: DbClient;
  logger: Logger;
  supabase: ReturnType<typeof createClient>;
  externalApi: ExternalApiClient;  // 追加
  env: Env;
};

let ctx: WorkerContext | null = null;

export const getContext = (): WorkerContext => {
  if (!ctx) {
    ctx = {
      db: createDbClient(env.DATABASE_URL),
      logger: createLogger({ context: { name: "Worker" } }),
      supabase: createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY),
      externalApi: createExternalApiClient(env.EXTERNAL_API_URL, env.EXTERNAL_API_KEY),  // 追加
      env,
    };
  }
  return ctx;
};
```

---

## エラーハンドリングパターン

### タスク内でのエラー処理

```typescript
export const riskyTask = async (ctx: WorkerContext): Promise<TaskResult> => {
  try {
    // メイン処理
    await doSomethingRisky();
    return { status: "ok", message: "Success" };
  } catch (error) {
    // エラーログを出力（スタックトレース付き）
    ctx.logger.error("Task failed", { taskName: "riskyTask" }, error as Error);

    // エラー結果を返す（throw しない）
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
```

### ジョブ内での部分的な失敗

```typescript
export const multiStepJob = async (ctx: WorkerContext) => {
  const results = {
    step1: await step1Task(ctx),
    step2: await step2Task(ctx),
    step3: await step3Task(ctx),
  };

  // 全体の成功判定
  const success = Object.values(results).every((r) => r.status === "ok");

  // 部分的な失敗も許容し、結果を返す
  return { success, results };
};
```

---

## DB 操作パターン

### 読み取り操作

```typescript
import { eq } from "@packages/db";
import type { WorkerContext } from "@/lib";

export const fetchActiveUsers = async (ctx: WorkerContext) => {
  const users = await ctx.db.query.users.findMany({
    where: eq(users.isActive, true),
  });
  return users;
};
```

### 更新操作

```typescript
import { eq, users } from "@packages/db";
import type { WorkerContext } from "@/lib";

export const deactivateUser = async (ctx: WorkerContext, userId: string) => {
  const result = await ctx.db
    .update(users)
    .set({ isActive: false })
    .where(eq(users.id, userId))
    .returning();

  return result[0] ?? null;
};
```

### トランザクション

```typescript
export const transferPoints = async (
  ctx: WorkerContext,
  fromUserId: string,
  toUserId: string,
  amount: number,
) => {
  return ctx.db.transaction(async (tx) => {
    // 送信元から減算
    await tx
      .update(users)
      .set({ points: sql`points - ${amount}` })
      .where(eq(users.id, fromUserId));

    // 送信先に加算
    await tx
      .update(users)
      .set({ points: sql`points + ${amount}` })
      .where(eq(users.id, toUserId));

    return { success: true };
  });
};
```

---

## テスト実行パターン

### 単体でジョブをテスト

```bash
# health-check ジョブを実行
pnpm worker job health-check

# data-sync ジョブを実行
pnpm worker job data-sync
```

### デーモンをローカルで起動

```bash
# フォアグラウンドで起動（Ctrl+C で停止）
pnpm worker daemon
```
