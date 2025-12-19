import type { DayInfo, WeekInfo } from "../types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * ISO日付文字列をローカルDateに変換（タイムゾーン安全）
 * @param dateString "YYYY-MM-DD" 形式の文字列
 * @returns ローカルタイムゾーンの Date オブジェクト
 */
export const parseISODate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * ISO形式の日付文字列を生成
 * @param date 変換する日付
 * @returns "YYYY-MM-DD" 形式の文字列
 */
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 日付を「○月○日(曜) HH:MM」形式にフォーマット
 * @param date 変換する日付
 * @returns "○月○日(曜) HH:MM" 形式の文字列
 */
export const formatDateTime = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS[date.getDay()];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}月${day}日(${weekday}) ${hours}:${minutes}`;
};

/**
 * 日付が今日かどうか判定
 * @param date 判定する日付
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

/**
 * 日付が週末かどうか判定
 * @param date 判定する日付
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const createDayInfo = (date: Date): DayInfo => ({
  date: new Date(date),
  day: date.getDate(),
  isWeekend: isWeekend(date),
  isToday: isToday(date),
  dateString: formatDateToISO(date),
});

/**
 * 指定された週の開始日から WeekInfo を生成
 * @param weekStartDate 週の開始日（月曜日）
 * @param imageUrl 週の画像URL（デフォルト: null）
 */
export const createWeekInfo = (
  weekStartDate: Date,
  imageUrl: string | null = null,
): WeekInfo => {
  const days: DayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(weekStartDate.getDate() + i);
    days.push(createDayInfo(currentDate));
  }

  return {
    weekId: formatDateToISO(weekStartDate),
    days,
    imageUrl,
  };
};
