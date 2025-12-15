/**
 * ログレベル定義
 * 優先度: debug < info < warn < error < fatal
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/**
 * ログレベルの優先度マップ
 */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

/**
 * ログコンテキスト（追加のメタデータ）
 */
export type LogContext = Record<string, unknown>;

/**
 * シリアライズ済みエラー型
 * Error オブジェクトを JSON 出力可能な形式に変換したもの
 */
export type SerializedError = {
  name: string;
  message: string;
  stack?: string;
  cause?: SerializedError;
};

/**
 * ログエントリの構造
 */
export type LogEntry = {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: SerializedError;
};

/**
 * ロガーオプション
 */
export type LoggerOptions = {
  /** 最小ログレベル（これ以上のレベルのみ出力）。デフォルト: "info" */
  level?: LogLevel;
  /** 本番環境かどうか。trueならJSON形式、falseなら色付きテキスト形式。デフォルト: false */
  isProduction?: boolean;
  /** 実行環境。"native" の場合は console.error を console.warn に置き換え */
  environment?: string;
  /** 継承されるコンテキスト */
  context?: LogContext;
};

/**
 * ロガーインターフェース
 */
export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext, error?: Error): void;
  fatal(message: string, context?: LogContext, error?: Error): void;

  /** コンテキストを継承した子ロガーを作成 */
  child(context: LogContext): Logger;
}
