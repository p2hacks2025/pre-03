import type { DayInfo, MonthGroup, WeekInfo } from "../types";

/**
 * ISO形式の日付文字列を生成
 * @param date 変換する日付
 * @returns "YYYY-MM-DD" 形式の文字列
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 日付が今日かどうか判定
 * @param date 判定する日付
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * 日付が週末かどうか判定
 * @param date 判定する日付
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * 指定された日付を含む週の月曜日を取得
 * @param date 基準となる日付
 * @returns その週の月曜日 00:00:00
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const daysToMonday = (day + 6) % 7;
  result.setDate(result.getDate() - daysToMonday);
  result.setHours(0, 0, 0, 0);
  return result;
}

function createDayInfo(date: Date): DayInfo {
  return {
    date: new Date(date),
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    isWeekend: isWeekend(date),
    isToday: isToday(date),
    dateString: formatDateToISO(date),
  };
}

/**
 * 指定された週の開始日から WeekInfo を生成
 * @param weekStartDate 週の開始日（月曜日）
 * @param imageUrl 週の画像URL（デフォルト: null）
 */
export function createWeekInfo(
  weekStartDate: Date,
  imageUrl: string | null = null,
): WeekInfo {
  const days: DayInfo[] = [];
  const monthCounts: Record<number, number> = {};

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(weekStartDate.getDate() + i);

    const dayInfo = createDayInfo(currentDate);
    days.push(dayInfo);

    const month = dayInfo.month;
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  }

  const months = Object.keys(monthCounts).map(Number);
  const primaryMonth = months.reduce((a, b) =>
    monthCounts[a] >= monthCounts[b] ? a : b,
  );

  const endDate = new Date(weekStartDate);
  endDate.setDate(weekStartDate.getDate() + 6);

  return {
    weekId: formatDateToISO(weekStartDate),
    days,
    primaryMonth,
    startDate: new Date(weekStartDate),
    endDate,
    imageUrl,
  };
}

/**
 * 過去N週間分の WeekInfo 配列を生成
 * @param startWeekDate 開始となる週の月曜日
 * @param count 生成する週の数
 * @param getImageUrl weekId から画像URLを取得するコールバック（省略可）
 * @returns 現在週から過去に向かう週の配列
 */
export function generatePastWeeks(
  startWeekDate: Date,
  count: number,
  getImageUrl?: (weekId: string) => string | null,
): WeekInfo[] {
  const weeks: WeekInfo[] = [];

  for (let i = 0; i < count; i++) {
    const weekStart = new Date(startWeekDate);
    weekStart.setDate(startWeekDate.getDate() - i * 7);
    const weekId = formatDateToISO(weekStart);
    const imageUrl = getImageUrl?.(weekId) ?? null;
    weeks.push(createWeekInfo(weekStart, imageUrl));
  }

  return weeks;
}

/**
 * 週リストを月ごとにグループ化
 * @param weeks グループ化する週の配列
 * @returns primaryMonth を基準にグループ化された月の配列
 */
export function groupWeeksByMonth(weeks: WeekInfo[]): MonthGroup[] {
  const groupMap = new Map<string, MonthGroup>();

  for (const week of weeks) {
    const year = week.startDate.getFullYear();
    // 年末年始で primaryMonth と startDate の月がずれる場合の年調整
    const adjustedYear =
      week.primaryMonth === 11 && week.startDate.getMonth() === 0
        ? year - 1
        : week.primaryMonth === 0 && week.startDate.getMonth() === 11
          ? year + 1
          : year;

    const monthId = `${adjustedYear}-${String(week.primaryMonth + 1).padStart(2, "0")}`;

    if (!groupMap.has(monthId)) {
      groupMap.set(monthId, {
        monthId,
        month: week.primaryMonth,
        year: adjustedYear,
        weeks: [],
      });
    }

    groupMap.get(monthId)?.weeks.push(week);
  }

  return Array.from(groupMap.values());
}
