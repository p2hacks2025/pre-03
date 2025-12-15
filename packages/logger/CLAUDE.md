# @packages/logger CLAUDE.md

モノレポ全体で使用する構造化ロギングユーティリティ。環境に応じたフォーマット出力（開発: 色付きテキスト、本番: JSON）をサポート。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | TypeScript |
| 出力形式 | 開発: ANSI カラーテキスト / 本番: JSON |
| 対応環境 | Node.js, Cloudflare Workers, React Native |

---

## アーキテクチャ全体像

### 設計原則

1. **ゼロ依存**: 外部ライブラリに依存しない軽量設計
2. **環境適応**: isProduction フラグで出力形式を自動切り替え
3. **構造化ログ**: コンテキスト情報を付加した構造化ログ出力
4. **チェーン可能**: `child()` で親コンテキストを継承した子ロガーを作成

### ログレベル優先度

```
debug (0) < info (1) < warn (2) < error (3) < fatal (4)
```

設定した最小レベル以上のログのみ出力される。

---

## プロジェクト構造

```
src/
├── index.ts      # エクスポート集約
├── logger.ts     # ロガー実装クラス（LoggerImpl）
├── types.ts      # 型定義（LogLevel, Logger, LogEntry など）
├── formatter.ts  # フォーマッター（開発/本番）
└── utils.ts      # ユーティリティ（時刻フォーマット、エラーシリアライズ）
```

---

## 各ファイルの役割

### index.ts

エクスポート集約。外部からは `createLogger` 関数と型定義のみ公開。

### logger.ts

ロガー実装クラス `LoggerImpl`。

| メソッド | 説明 |
|---------|------|
| `debug(message, context?)` | デバッグログ出力 |
| `info(message, context?)` | 情報ログ出力 |
| `warn(message, context?)` | 警告ログ出力 |
| `error(message, context?, error?)` | エラーログ出力 |
| `fatal(message, context?, error?)` | 致命的エラーログ出力 |
| `child(context)` | コンテキストを継承した子ロガーを作成 |

### types.ts

型定義。

| 型 | 説明 |
|---|------|
| `LogLevel` | `"debug" \| "info" \| "warn" \| "error" \| "fatal"` |
| `LogContext` | `Record<string, unknown>` - 追加メタデータ |
| `LogEntry` | ログエントリ構造（timestamp, level, message, context, error） |
| `LoggerOptions` | ロガー作成オプション |
| `Logger` | ロガーインターフェース |
| `SerializedError` | シリアライズ済みエラー型 |

### formatter.ts

環境に応じたログフォーマッター。

| フォーマッター | 用途 | 出力例 |
|--------------|------|--------|
| `formatLocal` | 開発環境 | `10:30:45 INFO  Server started { port: 8787 }` |
| `formatProduction` | 本番環境 | `{"timestamp":"2025-12-06T10:30:45.123Z","level":"info","message":"Server started","port":8787}` |

### utils.ts

ユーティリティ関数。

| 関数 | 説明 |
|-----|------|
| `formatTime(date)` | 時刻を `HH:mm:ss` 形式に変換 |
| `serializeError(error)` | Error オブジェクトを JSON 化可能な形式に変換（cause も再帰処理） |

---

## 使用方法

### 基本的な使い方

```typescript
import { createLogger } from "@packages/logger";

const logger = createLogger({
  level: "info",           // 最小ログレベル（デフォルト: "info"）
  isProduction: false,     // 本番環境フラグ（デフォルト: false）
});

logger.info("Server started", { port: 8787 });
// 出力: 10:30:45 INFO  Server started { port: 8787 }

logger.error("Database connection failed", { host: "localhost" }, new Error("Connection refused"));
// 出力: エラー情報 + スタックトレース
```

### 子ロガーの作成

```typescript
const logger = createLogger({ level: "debug" });

// リクエストIDを付加した子ロガー
const requestLogger = logger.child({ requestId: "abc-123" });

requestLogger.info("Processing request");
// 出力: 10:30:45 INFO  Processing request { requestId: "abc-123" }
```

### React Native 環境での使用

```typescript
const logger = createLogger({
  level: "info",
  environment: "native",  // LogBox の問題を回避
});
```

**注意**: `environment: "native"` を指定すると、`error` / `fatal` レベルでも `console.warn` を使用する。これは React Native の LogBox が `console.error` を特殊処理して正常な文字列を null と表示する問題を回避するため。

---

## 各アプリでの使用例

### apps/api（Hono ミドルウェア）

```typescript
// middleware/logger.ts
import { createLogger } from "@packages/logger";

const logger = createLogger({
  level: env.LOG_LEVEL ?? "info",
  isProduction: env.ENVIRONMENT === "production",
});

// リクエストごとに子ロガーを作成
const requestLogger = logger.child({ requestId });
```

### apps/web（Next.js）

```typescript
// lib/logger.ts
import { createLogger } from "@packages/logger";

export const logger = createLogger({
  level: env.LOG_LEVEL ?? "info",
  isProduction: process.env.NODE_ENV === "production",
});
```

### apps/native（Expo）

```typescript
// lib/logger.ts
import { createLogger } from "@packages/logger";

export const logger = createLogger({
  level: __DEV__ ? "debug" : "info",
  isProduction: !__DEV__,
  environment: "native",
});
```

---

## LoggerOptions 一覧

| オプション | 型 | デフォルト | 説明 |
|-----------|---|----------|------|
| `level` | `LogLevel` | `"info"` | 最小ログレベル |
| `isProduction` | `boolean` | `false` | true: JSON形式、false: 色付きテキスト |
| `environment` | `string` | `undefined` | `"native"` で React Native 対応 |
| `context` | `LogContext` | `{}` | 継承されるコンテキスト |

---

## 開発コマンド

| コマンド | 説明 |
|----------|------|
| `pnpm check` | Biome チェック |
| `pnpm check:fix` | Biome 自動修正 |
| `pnpm typecheck` | 型チェック |
| `pnpm clean` | `.turbo` キャッシュ削除 |

---

## 参考にするべきファイル

### ロガー使用例

| 参考ファイル | 内容 |
|-------------|------|
| `apps/api/src/middleware/logger.ts` | Hono ミドルウェアでの使用例 |
| `apps/web/src/lib/logger.ts` | Next.js での使用例 |

### パターン別

| パターン | 参考ファイル |
|---------|-------------|
| 子ロガー作成 | `apps/api/src/middleware/logger.ts` |
| 本番/開発切り替え | `apps/api/src/middleware/logger.ts` |
