/**
 * ISO 8601日時文字列を相対時間に変換
 * @param isoDateString - "2025-12-18T10:30:00.000Z"
 * @returns "たった今", "5分前", "2時間前", "3日前", "12月18日" など
 */
export const formatRelativeTime = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};
