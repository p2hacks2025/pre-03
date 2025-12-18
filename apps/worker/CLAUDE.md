# apps/worker CLAUDE.md

Node.js + tsx によるバッチ処理・定期実行ワーカー。CLI での単発実行と node-cron によるデーモン実行に対応。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| ランタイム | Node.js + tsx |
| スケジューラー | node-cron |
| データベース | Drizzle ORM（PostgreSQL） |
| 外部サービス | Supabase, Google Gemini API |
| 環境変数 | @t3-oss/env-core + dotenv |
| ロギング | @packages/logger |

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [README.md](./README.md) | ディレクトリ構造と触る頻度の目安 |
| [RECIPES.md](./RECIPES.md) | 具体的なコード例付きの実装パターン集 |

---

## アーキテクチャ全体像

### 軽量2層アーキテクチャ

バッチ処理に特化した **jobs → tasks の2層構造**を採用。

**設計原則**:

1. **タスクの単一責任**: 1タスク = 1処理（DB チェック、外部 API 呼び出しなど）
2. **ジョブによるオーケストレーション**: 複数タスクを組み合わせて実行
3. **Context による依存注入**: DB、Logger、Supabase を WorkerContext で一元管理

**依存の方向**:

```
cli.ts / daemon.ts（エントリーポイント）
    ↓ 呼び出し
jobs/（ジョブ層）
    ↓ 呼び出し
tasks/（タスク層）
    ↓ 使用
lib/（共通ユーティリティ）
```

---

## プロジェクト構造

```
src/
├── cli.ts              # CLI エントリーポイント（単発実行）
├── daemon.ts           # デーモンエントリーポイント（スケジュール実行）
│
├── jobs/               # ジョブ層（タスクのオーケストレーション）
│   ├── index.ts        # ジョブ登録・エクスポート
│   └── {job-name}.ts   # 個別ジョブ（health-check.ts）
│
├── tasks/              # タスク層（単一処理）
│   ├── index.ts        # タスクエクスポート
│   └── {task-name}.ts  # 個別タスク（health.ts）
│
└── lib/                # 共通ユーティリティ
    ├── index.ts        # 統合エクスポート
    ├── assets.ts       # アセット読み込み（画像・プロンプト）
    ├── context.ts      # WorkerContext 生成
    └── env.ts          # 環境変数パース
```

---

## 共通パッケージとの関係

### パッケージ一覧

| パッケージ | 役割 |
|-----------|------|
| `@packages/db` | Drizzle ORM スキーマ・クライアント |
| `@packages/env` | 環境変数の型定義（workerKeys） |
| `@packages/logger` | ロギングユーティリティ |

### 依存関係図

```
apps/worker (@repo/worker)
├─── @packages/db ──────────────┐
├─── @packages/env ─────────────┤ ワークスペース依存
└─── @packages/logger ──────────┘

外部依存:
├─── @google/genai ─────────────  Gemini API クライアント
├─── @supabase/supabase-js ───── Supabase クライアント
├─── node-cron ─────────────────  スケジューラー
├─── dotenv ────────────────────  環境変数読み込み
└─── tsx ───────────────────────  TypeScript 実行
```

---

## 各レイヤーの役割

### jobs/（ジョブ層）

複数タスクを組み合わせて実行するオーケストレーション層。

| ファイル | 役割 |
|---------|------|
| `index.ts` | ジョブ登録（`jobs` オブジェクトにジョブを追加） |
| `{job-name}.ts` | 個別ジョブの実装（タスク呼び出し + 結果集約） |

→ 実装例は [RECIPES.md](./RECIPES.md#ジョブの追加) を参照

### tasks/（タスク層）

単一の処理を実行するタスク層。DB 操作、外部 API 呼び出しなど。

| ファイル | 役割 |
|---------|------|
| `index.ts` | タスクエクスポート |
| `{task-name}.ts` | 個別タスクの実装 |

→ 実装例は [RECIPES.md](./RECIPES.md#タスクの追加) を参照

### lib/（共通ユーティリティ）

| ファイル | 役割 |
|---------|------|
| `assets.ts` | アセット読み込み（ベース画像、ガイド画像、システムプロンプト） |
| `context.ts` | `WorkerContext` 生成（db, logger, supabase, env） |
| `env.ts` | 環境変数パース（dotenv + @t3-oss/env-core） |
| `index.ts` | 統合エクスポート |

→ 拡張方法は [RECIPES.md](./RECIPES.md#workercontext-の拡張) を参照

---

## WorkerContext

ジョブ・タスクに渡される依存オブジェクト。

```typescript
type WorkerContext = {
  db: DbClient;                           // Drizzle ORM クライアント
  logger: Logger;                         // @packages/logger
  supabase: ReturnType<typeof createClient>;  // Supabase クライアント
  env: Env;                               // 環境変数
};
```

**使用例**:

```typescript
export const myTask = async (ctx: WorkerContext) => {
  ctx.logger.info("Starting task");
  const users = await ctx.db.query.users.findMany();
  // ...
};
```

---

## 実行モード

### 1. CLI モード（単発実行）

```bash
pnpm worker job <job-name>
```

- `cli.ts` がエントリーポイント
- 指定したジョブを1回だけ実行
- デバッグや手動実行に使用

### 2. デーモンモード（スケジュール実行）

```bash
pnpm worker daemon
```

- `daemon.ts` がエントリーポイント
- `schedules` 配列に定義されたスケジュールで定期実行
- プロセスはフォアグラウンドで動作（PM2 や systemd で管理）

---

## 参考にするべきファイル

### 新規ジョブ追加時

| 参考ファイル | 内容 |
|-------------|------|
| `jobs/health-check.ts` | ジョブ実装の例（複数タスク呼び出し） |
| `jobs/index.ts` | ジョブ登録の例 |
| `tasks/health.ts` | タスク実装の例（DB / Supabase チェック） |
| `tasks/index.ts` | タスクエクスポートの例 |

### パターン別参考ファイル

| パターン | 参考ファイル |
|---------|-------------|
| DB 操作タスク | `tasks/health.ts`（`checkDb`）、`tasks/daily-update.ts` |
| Supabase 操作タスク | `tasks/health.ts`（`checkSupabase`） |
| Storage 操作タスク | `tasks/daily-update.ts`（`uploadGeneratedImage`） |
| 外部 API 呼び出しタスク | `tasks/daily-update.ts`（`generateImage`） |
| 複数タスクのオーケストレーション | `jobs/health-check.ts`、`jobs/daily-update.ts` |
| スケジュール定義 | `daemon.ts`（`schedules` 配列） |
| Context 拡張 | `lib/context.ts` |
| アセット読み込み | `lib/assets.ts` |

---

## 開発コマンド

> **Note**: monorepo 構成のため、実行するディレクトリに注意。
> ルート（`/`）から実行する場合は `pnpm worker <command>` を使用。
> `apps/worker/` ディレクトリ内から実行する場合は `pnpm <command>` を使用。

| コマンド | 説明 |
|----------|------|
| `pnpm job <job-name>` | 指定ジョブを単発実行 |
| `pnpm daemon` | デーモンモードで起動 |
| `pnpm typecheck` | 型チェック |
| `pnpm check` | Biome チェック |
| `pnpm check:fix` | Biome 自動修正 |

**利用可能なジョブ**:

| ジョブ名 | 説明 |
|---------|------|
| `daily-update` | 1日の終わりに画像を更新（Gemini API で画像生成） |
| `health-check` | DB・Supabase 接続チェック |

---

## 環境変数

### .env ファイル

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | PostgreSQL 接続文字列 |
| `SUPABASE_URL` | Supabase プロジェクト URL |
| `SUPABASE_ANON_KEY` | Supabase 匿名キー |
| `GOOGLE_API_KEY` | Google AI API キー（Gemini 画像生成用） |
| `DEFAULT_AI_PROFILE_ID` | デフォルトの AI プロファイル UUID |

### 環境変数の読み込み

`lib/env.ts` で dotenv + @t3-oss/env-core を使用して読み込み。
`.env` ファイルは `apps/worker/.env` に配置。

> **Note**: `.env` ファイルはセキュリティ上の理由から Claude Code では読み取れません。
> 環境変数の内容を確認する場合は `.env.example` を参照してください。

---

## スケジュール定義

`daemon.ts` の `schedules` 配列でスケジュールを管理。

```typescript
const schedules = [
  { name: "health-check", cron: "* * * * *", job: jobs["health-check"] },
] as const;
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

## 参考リンク

- [node-cron](https://github.com/node-cron/node-cron)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [@t3-oss/env-core](https://env.t3.gg/)
