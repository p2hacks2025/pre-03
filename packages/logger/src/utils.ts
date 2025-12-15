import type { SerializedError } from "./types";

/**
 * 現在時刻を取得（HH:mm:ss 形式）
 */
export const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 8);
};

/**
 * Error オブジェクトをシリアライズ可能な形式に変換
 * cause も再帰的に処理（最大3階層）
 */
export const serializeError = (error: Error, depth = 0): SerializedError => {
  const maxDepth = 3;

  const serialized: SerializedError = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  if (error.cause instanceof Error && depth < maxDepth) {
    serialized.cause = serializeError(error.cause, depth + 1);
  }

  return serialized;
};
