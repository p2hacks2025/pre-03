# Worker リファクタリング計画

## 目標

1. `lib/infra.ts` をドメインごとに分割
2. `jobs → tasks → lib` の依存関係を徹底（ビジネスロジック統合方式）
3. jobs を簡素化し、tasks に高レベル関数を作成

---

## 現状の問題点

### 1. lib/infra.ts の肥大化（350行以上、17関数）

異なるドメインの関数が混在：

| ドメイン | 関数 |
|---------|------|
| WeeklyWorld | `getWeeklyWorld`, `findWeeklyWorld`, `createWeeklyWorld`, `updateWeeklyWorldImage`, `selectFieldId`, `createOrUpdateWorldBuildLog` |
| UserPost | `getUserPostsByDate`, `getUserPostsForWeek`, `getRecentUserPosts`, `getRandomHistoricalPosts` |
| AiPost | `getRandomAiProfile`, `hasExistingAiPost`, `createAiPost` |
| UserProfile | `getAllUserProfiles` |
| Storage | `uploadGeneratedImage` |

### 2. 依存関係の違反

CLAUDE.md では `jobs → tasks → lib` だが、実際は：

```
jobs/daily-update.ts
├── lib/infra.ts (直接呼び出し) ← 違反
└── tasks/daily-update.ts

jobs/weekly-reset.ts
├── lib/infra.ts (直接呼び出し) ← 違反
└── tasks/weekly-reset.ts
```

### 3. ai-post ジョブの重複コード

`ai-post-short-term.ts` と `ai-post-long-term.ts` に類似パターンあり。

---

## 実装タスク（feature粒度）

| # | タイトル | 内容 |
|---|---------|------|
| 1 | lib/infra.ts のドメイン分割 | infra/ ディレクトリに5ファイル分割 |
| 2 | daily-update ジョブのリファクタリング | tasks拡張 + jobs簡素化 |
| 3 | weekly-reset ジョブのリファクタリング | tasks拡張 + jobs簡素化 |
| 4 | ai-post ジョブのリファクタリング | tasks拡張 + jobs簡素化（short-term/long-term両方） |
| 5 | リファクタリング完了・ドキュメント更新 | CLAUDE.md更新、最終確認 |

**依存関係**: タスク1 → タスク2,3,4（並行可能）→ タスク5

---

## タスク1: lib/infra.ts の分割

### 変更内容

```
lib/
├── infra/
│   ├── index.ts           # 統合エクスポート
│   ├── weekly-world.ts    # WeeklyWorld関連（6関数）
│   ├── user-post.ts       # UserPost関連（4関数）
│   ├── ai-post.ts         # AiPost関連（3関数）
│   ├── user-profile.ts    # UserProfile関連（1関数）
│   └── storage.ts         # Storage操作（1関数）
└── index.ts               # 更新
```

### 分割マッピング

| 新ファイル | 関数 |
|-----------|------|
| `weekly-world.ts` | `getWeeklyWorld`, `findWeeklyWorld`, `createWeeklyWorld`, `updateWeeklyWorldImage`, `selectFieldId`, `createOrUpdateWorldBuildLog` |
| `user-post.ts` | `getUserPostsByDate`, `getUserPostsForWeek`, `getRecentUserPosts`, `getRandomHistoricalPosts`, `UserPostsGroupedByUser` |
| `ai-post.ts` | `getRandomAiProfile`, `hasExistingAiPost`, `createAiPost`, `CreateAiPostParams` |
| `user-profile.ts` | `getAllUserProfiles` |
| `storage.ts` | `uploadGeneratedImage` |

### 作業手順

1. `lib/infra/` ディレクトリ作成
2. 各ファイルに関数を移動
3. `lib/infra/index.ts` で統合エクスポート
4. `lib/index.ts` を更新（`./infra` から re-export）
5. 既存のインポートは変更不要（lib/index.ts経由で互換性維持）

---

## タスク2: daily-update リファクタリング

### tasks/daily-update.ts 拡張

**追加する関数**:

```typescript
// 1ユーザーの日次更新処理を統合
export const processUserDailyUpdate = async (
  ctx: WorkerContext,
  group: UserPostsGroupedByUser,
  targetDate: Date,
  weekStartDate: Date,
): Promise<void> => {
  // 1. getWeeklyWorld
  // 2. selectFieldId
  // 3. fetchImageAsBase64
  // 4. generateImage
  // 5. uploadGeneratedImage
  // 6. updateWeeklyWorldImage
  // 7. createOrUpdateWorldBuildLog
};

// 対象日の投稿を取得
export const fetchUserPostsByDate = async (
  ctx: WorkerContext,
  targetDate: Date,
): Promise<UserPostsGroupedByUser[]> => {
  // getUserPostsByDate をラップ
};
```

### jobs/daily-update.ts 簡素化

**変更後の構造**:

```typescript
import { type WorkerContext } from "@/lib";
import {
  fetchUserPostsByDate,
  getJstYesterday,
  getWeekStartDate,
  processUserDailyUpdate,
} from "@/tasks";

export const dailyUpdate = async (ctx: WorkerContext) => {
  const targetDate = getJstYesterday();
  const weekStartDate = getWeekStartDate(targetDate);
  const groups = await fetchUserPostsByDate(ctx, targetDate);

  for (const group of groups) {
    await processUserDailyUpdate(ctx, group, targetDate, weekStartDate);
  }
};
```

---

## タスク3: weekly-reset リファクタリング

### tasks/weekly-reset.ts 拡張

**追加する関数**:

```typescript
// 1ユーザーの週次リセット処理（投稿あり）
export const processUserWeeklyResetWithPosts = async (
  ctx: WorkerContext,
  profile: UserProfile,
  posts: UserPost[],
  newWeekStart: Date,
): Promise<string> => {
  // 1. summarizePostsWithLLM
  // 2. selectRandomFieldIds
  // 3. generateImage x2
  // 4. uploadGeneratedImage x2
  // 5. createWeeklyWorld
  // 6. createOrUpdateWorldBuildLog x2
  // return: initialImageUrl
};

// 1ユーザーの週次リセット処理（投稿なし）
export const processUserWeeklyResetWithoutPosts = async (
  ctx: WorkerContext,
  profile: UserProfile,
  newWeekStart: Date,
): Promise<string> => {
  // 1. uploadGeneratedImage (base image)
  // 2. createWeeklyWorld
  // return: initialImageUrl
};

// 全ユーザープロファイル取得
export const fetchAllUserProfiles = async (
  ctx: WorkerContext,
): Promise<UserProfile[]> => {
  // getAllUserProfiles をラップ
};

// 週の投稿取得
export const fetchUserPostsForWeek = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
): Promise<UserPost[]> => {
  // getUserPostsForWeek をラップ
};
```

### jobs/weekly-reset.ts 簡素化

**変更後の構造**:

```typescript
import { type WorkerContext } from "@/lib";
import {
  fetchAllUserProfiles,
  fetchUserPostsForWeek,
  findWeeklyWorld,
  getNextWeekStart,
  getTargetWeekStart,
  processUserWeeklyResetWithPosts,
  processUserWeeklyResetWithoutPosts,
} from "@/tasks";

export const weeklyReset = async (ctx: WorkerContext) => {
  const targetWeekStart = getTargetWeekStart(ctx);
  const newWeekStart = getNextWeekStart(targetWeekStart);
  const profiles = await fetchAllUserProfiles(ctx);

  for (const profile of profiles) {
    const posts = await fetchUserPostsForWeek(ctx, profile.id, targetWeekStart);
    if (posts.length > 0) {
      await processUserWeeklyResetWithPosts(ctx, profile, posts, newWeekStart);
    } else {
      await processUserWeeklyResetWithoutPosts(ctx, profile, newWeekStart);
    }
  }
};
```

---

## タスク4: ai-post リファクタリング

### tasks/ai-post.ts 拡張

**追加する関数**:

```typescript
// ユーザー投稿に対するAI投稿を生成・保存
export const processUserAiPosts = async (
  ctx: WorkerContext,
  group: DiaryGroup,
  scheduleMin: number,
  scheduleMax: number,
): Promise<{ generated: number }> => {
  // 1. hasExistingAiPost チェック
  // 2. getRandomAiProfile
  // 3. generateAiPostContents
  // 4. createAiPost x N
};

// 過去投稿に対するAI投稿を生成・保存
export const processHistoricalAiPost = async (
  ctx: WorkerContext,
  diary: UserPost,
  scheduleMin: number,
  scheduleMax: number,
): Promise<{ generated: number }> => {
  // 1. getRandomAiProfile
  // 2. generateAiPostContents
  // 3. createAiPost x N
};

// 最近のユーザー投稿を取得
export const fetchRecentUserPosts = async (
  ctx: WorkerContext,
  minutes: number,
): Promise<UserPost[]> => {
  // getRecentUserPosts をラップ
};

// 過去のランダム投稿を取得
export const fetchRandomHistoricalPosts = async (
  ctx: WorkerContext,
  count: number,
  excludeDays: number,
): Promise<UserPost[]> => {
  // getRandomHistoricalPosts をラップ
};
```

### jobs/ai-post-short-term.ts 簡素化

**変更後の構造**:

```typescript
import { type WorkerContext } from "@/lib";
import {
  AI_POST_CONFIG,
  fetchRecentUserPosts,
  generateStandalonePosts,
  groupPostsByUser,
  processUserAiPosts,
  shouldExecuteWithChance,
} from "@/tasks";

export const aiPostShortTerm = async (ctx: WorkerContext) => {
  if (!shouldExecuteWithChance(AI_POST_CONFIG.SHORT_TERM_POST_CHANCE)) {
    return { skipped: true };
  }

  await generateStandalonePosts(ctx, ...);

  const posts = await fetchRecentUserPosts(ctx, AI_POST_CONFIG.SHORT_TERM_MINUTES);
  const groups = groupPostsByUser(posts);

  for (const group of groups) {
    await processUserAiPosts(ctx, group, ...);
  }
};
```

---

## 依存関係の最終形

```
cli.ts / daemon.ts
    ↓
jobs/（ジョブ層）
    ↓ 呼び出し（tasks のみ）
tasks/（タスク層）
    ↓ 呼び出し
lib/infra/（インフラ層）← ドメイン分割済み
    ↓ 使用
lib/（共通ユーティリティ: context, assets, constants, env）
```

---

## 修正対象ファイル一覧

### 新規作成

- `apps/worker/src/lib/infra/index.ts`
- `apps/worker/src/lib/infra/weekly-world.ts`
- `apps/worker/src/lib/infra/user-post.ts`
- `apps/worker/src/lib/infra/ai-post.ts`
- `apps/worker/src/lib/infra/user-profile.ts`
- `apps/worker/src/lib/infra/storage.ts`

### 修正

- `apps/worker/src/lib/index.ts`
- `apps/worker/src/tasks/daily-update.ts`
- `apps/worker/src/tasks/weekly-reset.ts`
- `apps/worker/src/tasks/ai-post.ts`
- `apps/worker/src/jobs/daily-update.ts`
- `apps/worker/src/jobs/weekly-reset.ts`
- `apps/worker/src/jobs/ai-post-short-term.ts`
- `apps/worker/src/jobs/ai-post-long-term.ts`
- `apps/worker/CLAUDE.md`

### 削除

- `apps/worker/src/lib/infra.ts`（タスク1完了後）

---

## 検証コマンド

各タスク完了後に実行:

```bash
pnpm worker typecheck
pnpm worker check
pnpm worker job health-check  # 動作確認
```
