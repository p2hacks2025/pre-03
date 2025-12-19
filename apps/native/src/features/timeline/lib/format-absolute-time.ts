/**
 * ISO 8601日時文字列を絶対時間に変換
 * @param isoDateString - "2025-12-18T10:30:00.000Z"
 * @returns "2025年12月18日 10:30"
 */
export const formatAbsoluteTime = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
};
