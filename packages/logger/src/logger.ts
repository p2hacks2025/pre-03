import { getFormatter } from "./formatter";
import type {
  LogContext,
  LogEntry,
  Logger,
  LoggerOptions,
  LogLevel,
} from "./types";
import { LOG_LEVEL_PRIORITY } from "./types";
import { serializeError } from "./utils";

/**
 * ロガー実装クラス
 */
class LoggerImpl implements Logger {
  private readonly minLevel: LogLevel;
  private readonly isProduction: boolean;
  private readonly isNative: boolean;
  private readonly context: LogContext;
  private readonly formatter: (entry: LogEntry) => string;

  constructor(options: LoggerOptions) {
    this.minLevel = options.level ?? "info";
    this.isProduction = options.isProduction ?? false;
    this.isNative = options.environment === "native";
    this.context = options.context ?? {};
    this.formatter = getFormatter(this.isProduction);
  }

  /**
   * ログレベルが出力対象かどうかを判定
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  /**
   * ログエントリを作成
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      context: { ...this.context, ...context },
      error: error ? serializeError(error) : undefined,
    };
  }

  /**
   * ログを出力
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createEntry(level, message, context, error);
    const formattedMessage = this.formatter(entry);

    // レベルに応じたコンソールメソッドを使用
    switch (level) {
      case "debug":
        console.debug(formattedMessage);
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "error":
      case "fatal":
        // React Native の LogBox は console.error を特殊処理して
        // 正常な文字列でも null と表示するため、native 環境では console.warn を使用
        if (this.isNative) {
          console.warn(formattedMessage);
        } else {
          console.error(formattedMessage);
        }
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log("error", message, context, error);
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    this.log("fatal", message, context, error);
  }

  /**
   * コンテキストを継承した子ロガーを作成
   */
  child(additionalContext: LogContext): Logger {
    return new LoggerImpl({
      level: this.minLevel,
      isProduction: this.isProduction,
      environment: this.isNative ? "native" : undefined,
      context: { ...this.context, ...additionalContext },
    });
  }
}

/**
 * ロガーを作成するファクトリ関数
 */
export const createLogger = (options: LoggerOptions): Logger => {
  return new LoggerImpl(options);
};
