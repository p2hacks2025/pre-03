import type { LogEntry, LogLevel } from "./types";
import { formatTime } from "./utils";

/**
 * ANSI カラーコード
 */
const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  // レベル別の色
  debug: "\x1b[35m", // マゼンタ
  info: "\x1b[32m", // 緑
  warn: "\x1b[33m", // 黄色
  error: "\x1b[31m", // 赤
  fatal: "\x1b[31m", // 赤
} as const;

/**
 * ログレベルのラベル（固定幅5文字）
 */
const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "DEBUG",
  info: "INFO ",
  warn: "WARN ",
  error: "ERROR",
  fatal: "FATAL",
};

/**
 * コンテキストをコンパクトな形式で表示
 * 例: { port: 8787, host: "localhost" }
 */
const formatContextCompact = (context: Record<string, unknown>): string => {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(context)) {
    if (typeof value === "string") {
      parts.push(`${key}: "${value}"`);
    } else if (value === null) {
      parts.push(`${key}: null`);
    } else if (value === undefined) {
      parts.push(`${key}: undefined`);
    } else if (typeof value === "object") {
      parts.push(`${key}: ${JSON.stringify(value)}`);
    } else {
      parts.push(`${key}: ${value}`);
    }
  }

  return `{ ${parts.join(", ")} }`;
};

/**
 * ローカル環境用フォーマッター
 * 出力例: 10:30:45 INFO  Server started { port: 8787 }
 */
export const formatLocal = (entry: LogEntry): string => {
  const time = formatTime(entry.timestamp);
  const level = LEVEL_LABELS[entry.level];
  const color = COLORS[entry.level];

  let output = `${COLORS.dim}${time}${COLORS.reset} ${color}${level}${COLORS.reset} ${entry.message}`;

  if (entry.context && Object.keys(entry.context).length > 0) {
    output += ` ${COLORS.dim}${formatContextCompact(entry.context)}${COLORS.reset}`;
  }

  // エラー情報を追加
  if (entry.error) {
    output += `\n${color}  └─ ${entry.error.name}: ${entry.error.message}${COLORS.reset}`;
    if (entry.error.stack) {
      // スタックトレースの最初の3行を表示（1行目はエラーメッセージなのでスキップ）
      const stackLines = entry.error.stack.split("\n").slice(1, 4);
      output += `\n${COLORS.dim}${stackLines.map((l) => `     ${l.trim()}`).join("\n")}${COLORS.reset}`;
    }
  }

  return output;
};

/**
 * 本番環境用フォーマッター（JSON フラット展開）
 * 出力例: {"timestamp":"2025-12-06T10:30:45.123Z","level":"info","message":"Server started","port":8787}
 */
export const formatProduction = (entry: LogEntry): string => {
  const baseLog: Record<string, unknown> = {
    timestamp: entry.timestamp.toISOString(),
    level: entry.level,
    message: entry.message,
  };

  if (entry.context) {
    for (const [key, value] of Object.entries(entry.context)) {
      if (key in baseLog) {
        baseLog[`ctx_${key}`] = value;
      } else {
        baseLog[key] = value;
      }
    }
  }

  // エラー情報を追加
  if (entry.error) {
    baseLog.error = entry.error;
  }

  return JSON.stringify(baseLog);
};

/**
 * 環境に応じたフォーマッターを返す
 * @param isProduction - 本番環境の場合はtrue（JSON形式）、開発環境の場合はfalse（色付きテキスト）
 */
export const getFormatter = (
  isProduction: boolean,
): ((entry: LogEntry) => string) => {
  return isProduction ? formatProduction : formatLocal;
};
