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
    ↓ 呼び出し
lib/infra/（インフラ層）
    ↓ 使用
lib/（共通ユーティリティ: context, assets, constants, env, prompt, llm-config）
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
│   ├── health-check.ts
│   ├── daily-update.ts
│   ├── weekly-reset.ts
│   ├── ai-post-short-term.ts
│   ├── ai-post-long-term.ts
│   └── notification-test.ts
│
├── tasks/              # タスク層（ビジネスロジック）
│   ├── index.ts        # タスクエクスポート
│   ├── health.ts       # ヘルスチェック
│   ├── daily-update.ts # 日次更新処理
│   ├── weekly-reset.ts # 週次リセット処理
│   ├── ai-post.ts      # AI投稿生成
│   ├── notification.ts # 通知処理
│   └── utils.ts        # ユーティリティ関数
│
├── lib/                # 共通ユーティリティ
│   ├── index.ts        # 統合エクスポート
│   ├── assets.ts       # アセット読み込み（画像）
│   ├── constants.ts    # 定数定義
│   ├── context.ts      # WorkerContext 生成
│   ├── env.ts          # 環境変数パース
│   ├── llm-config.ts   # LLM設定（モデル・パラメータ）
│   ├── prompt.ts       # プロンプト定義
│   │
│   └── infra/          # インフラ層（DB・外部サービス操作）
│       ├── index.ts    # 統合エクスポート
│       ├── weekly-world.ts   # WeeklyWorld CRUD
│       ├── user-post.ts      # UserPost 取得
│       ├── ai-post.ts        # AiPost CRUD
│       ├── user-profile.ts   # UserProfile 取得
│       └── storage.ts        # Supabase Storage 操作
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
├─── @google/genai ─────────────  Gemini API クライアント（画像生成）
├─── openai ────────────────────  OpenAI API クライアント（テキスト生成）
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

ビジネスロジックを実装するタスク層。infra 層を使用して処理を実行。

| ファイル | 役割 |
|---------|------|
| `index.ts` | タスクエクスポート |
| `health.ts` | ヘルスチェック（DB・Supabase 接続確認） |
| `daily-update.ts` | 日次更新処理（画像生成・ワールド更新） |
| `weekly-reset.ts` | 週次リセット処理（新週ワールド作成） |
| `ai-post.ts` | AI投稿生成処理 |
| `notification.ts` | 通知処理 |
| `utils.ts` | 日付計算などのユーティリティ |

→ 実装例は [RECIPES.md](./RECIPES.md#タスクの追加) を参照

### lib/infra/（インフラ層）

データベース・外部サービスへのアクセスを提供するインフラ層。

| ファイル | 役割 |
|---------|------|
| `index.ts` | 統合エクスポート |
| `weekly-world.ts` | WeeklyWorld CRUD（取得・作成・更新） |
| `user-post.ts` | UserPost 取得（日別・週別・ランダム） |
| `ai-post.ts` | AiPost CRUD（作成・重複チェック） |
| `user-profile.ts` | UserProfile 取得 |
| `storage.ts` | Supabase Storage 操作（画像アップロード） |

### lib/（共通ユーティリティ）

| ファイル | 役割 |
|---------|------|
| `assets.ts` | アセット読み込み（ベース画像） |
| `constants.ts` | 定数定義（フィールドID範囲など） |
| `context.ts` | `WorkerContext` 生成（db, logger, supabase, env） |
| `env.ts` | 環境変数パース（dotenv + @t3-oss/env-core） |
| `llm-config.ts` | LLM設定（モデル名・パラメータ） |
| `prompt.ts` | プロンプト定義（シーン記述・画像生成用） |
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
| DB 操作（infra層） | `lib/infra/weekly-world.ts`、`lib/infra/user-post.ts` |
| Storage 操作（infra層） | `lib/infra/storage.ts` |
| タスク実装（処理統合） | `tasks/daily-update.ts`、`tasks/ai-post.ts` |
| 外部 API 呼び出し | `tasks/daily-update.ts`（`generateImage`, `generateSceneDescription`） |
| ジョブ実装（オーケストレーション） | `jobs/daily-update.ts`、`jobs/ai-post-short-term.ts` |
| スケジュール定義 | `daemon.ts`（`schedules` 配列） |
| Context 拡張 | `lib/context.ts` |
| プロンプト管理 | `lib/prompt.ts` |
| LLM設定管理 | `lib/llm-config.ts` |

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
| `health-check` | DB・Supabase 接続チェック |
| `daily-update` | 日次画像更新（Gemini API で画像生成） |
| `weekly-reset` | 週次リセット（新週ワールド作成） |
| `ai-post-short-term` | 短期AI投稿生成（直近投稿への反応） |
| `ai-post-long-term` | 長期AI投稿生成（過去投稿への反応） |
| `notification-test` | 通知テスト |

---

## 環境変数

### .env ファイル

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | PostgreSQL 接続文字列 |
| `SUPABASE_URL` | Supabase プロジェクト URL |
| `SUPABASE_ANON_KEY` | Supabase 匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー |
| `GOOGLE_API_KEY` | Google AI API キー（Gemini 画像生成用） |
| `OPENAI_API_KEY` | OpenAI API キー（テキスト生成用） |
| `ONESIGNAL_APP_ID` | OneSignal アプリID（通知用） |
| `ONESIGNAL_REST_API_KEY` | OneSignal REST API キー |

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

## AI投稿生成の確率制御

### ジョブ一覧

| ジョブ | 実行タイミング | 内容 |
|--------|---------------|------|
| `ai-post-short-term` | 5分ごと | ユーザー投稿への反応 + スタンドアロン（2%） |
| `ai-post-long-term` | 毎日3:00 | 過去投稿への反応 + スタンドアロン（50%で実行） |

### スタンドアロン投稿

ユーザー投稿に関係なく、AIが自発的に生成する投稿。

- **short-term**: 5分ごとに2%確率で生成
- **long-term**: ジョブ実行時（50%確率）に必ず生成

### 時間範囲と確率設定（short-term）

| 時間範囲 | base | perPost | 上限 |
|---------|------|---------|------|
| 30分 | 15% | 1% | 25% |
| 1時間 | 10% | 0.5% | 25% |
| 6時間 | 5% | 0.25% | 25% |
| 12時間 | 3% | 0.15% | 25% |
| 24時間 | 2% | 0.1% | 25% |

### 確率計算

```
確率 = min(baseChance + (投稿数 - 1) × perPostChance, 25%)
```

例: 30分以内に3投稿 → 15% + 2×1% = 17%

### 処理フロー（フォールバック方式）

1. **頻度チェック**: 直近1時間のAI投稿数が上限（5件）を超えていればスキップ
2. **スタンドアロン投稿**: 2%確率でランダム投稿を生成
3. **24時間分のユーザーポストを1回で取得**（DBアクセス最適化）
4. **ユーザーごとにループ**
   - 時間範囲を短い順にチェック（30分→1時間→6時間→12時間→24時間）
   - その時間範囲に投稿があれば → 確率判定して**終了**（次の範囲は見ない）
   - その時間範囲に投稿がなければ → 次の範囲をチェック
   - `hasExistingAiPost` で重複チェック

### 設定変更

`tasks/ai-post.ts` の以下の定数を編集:

- `USER_CHANCE_MAX`: 確率上限（デフォルト: 0.25）
- `TIME_WINDOWS`: 時間範囲ごとの確率設定
- `AI_POST_CONFIG.SHORT_TERM_POST_CHANCE`: スタンドアロン投稿確率（デフォルト: 0.02）

---

## 参考リンク

- [node-cron](https://github.com/node-cron/node-cron)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [@t3-oss/env-core](https://env.t3.gg/)
