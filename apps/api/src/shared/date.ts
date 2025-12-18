/**
 * 日付関連のユーティリティ（JST基準）
 *
 * このプロジェクトでは:
 * - DBはUTC（timestamp with time zone）で保存
 * - APIレスポンスはJST基準で返却
 */

/**
 * JST（日本標準時）のオフセット（時間）
 * UTC + 9時間 = JST
 */
export const JST_OFFSET_HOURS = 9;

/**
 * JST日時 → UTC Date
 *
 * @example
 * // JST 2025-12-01 00:00:00 → UTC 2025-11-30 15:00:00
 * jstToUTC(2025, 12, 1)
 *
 * // JST 2025-12-01 09:30:00 → UTC 2025-12-01 00:30:00
 * jstToUTC(2025, 12, 1, 9, 30)
 */
export const jstToUTC = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date => {
  return new Date(
    Date.UTC(year, month - 1, day, hour - JST_OFFSET_HOURS, minute, second),
  );
};

/**
 * 日付文字列/Date → YYYY-MM-DD 文字列
 * PostgreSQL の DATE 型は文字列で返されることがあるため対応
 */
export const formatDateString = (date: Date | string): string => {
  if (typeof date === "string") {
    // すでに YYYY-MM-DD 形式
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // ISO 形式から日付部分抽出
    return date.split("T")[0];
  }
  // Date オブジェクトは UTC で処理
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * PostgreSQLでtimestamptz(UTC)をJSTに変換するSQL片
 *
 * 注意: timestamp with time zone の場合は AT TIME ZONE 'Asia/Tokyo' のみでOK
 *       AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo' は逆効果になる
 *
 * 使用例: sql`DATE(${userPosts.createdAt} AT TIME ZONE 'Asia/Tokyo')`
 */
export const JST_TIMEZONE = "Asia/Tokyo";
