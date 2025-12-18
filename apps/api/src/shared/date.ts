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
 * JSTベースの月範囲をUTCのDateオブジェクトで取得
 *
 * 例: year=2025, month=12 の場合
 * - start: JST 12/1 0:00 = UTC 11/30 15:00
 * - end: JST 1/1 0:00 = UTC 12/31 15:00
 */
export const getJSTMonthRangeInUTC = (
  year: number,
  month: number,
): { start: Date; end: Date } => {
  return {
    start: new Date(Date.UTC(year, month - 1, 1, -JST_OFFSET_HOURS)),
    end: new Date(Date.UTC(year, month, 1, -JST_OFFSET_HOURS)),
  };
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
