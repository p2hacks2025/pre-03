import type { DayInfo, MonthGroup, WeekInfo } from "../types";

/**
 * ISO形式の日付文字列を生成 "YYYY-MM-DD"
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 日付が今日かどうか判定
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
 * 日付が週末かどうか判定 (土曜 = 6, 日曜 = 0)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * 指定された日付を含む週の月曜日を取得（月曜始まり）
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const daysToMonday = (day + 6) % 7;
  result.setDate(result.getDate() - daysToMonday);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * DayInfo を作成
 */
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
 */
export function createWeekInfo(weekStartDate: Date): WeekInfo {
  const days: DayInfo[] = [];
  const monthCounts: Record<number, number> = {};

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(weekStartDate.getDate() + i);

    const dayInfo = createDayInfo(currentDate);
    days.push(dayInfo);

    // 月のカウント（primaryMonth 計算用）
    const month = dayInfo.month;
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  }

  // 主要な月（最も多くの日が属する月）
  const months = Object.keys(monthCounts).map(Number);
  const primaryMonth = months.reduce((a, b) =>
    monthCounts[a] >= monthCounts[b] ? a : b,
  );

  // 週の終了日
  const endDate = new Date(weekStartDate);
  endDate.setDate(weekStartDate.getDate() + 6);

  return {
    weekId: formatDateToISO(weekStartDate),
    days,
    primaryMonth,
    startDate: new Date(weekStartDate),
    endDate,
  };
}

/**
 * 過去N週間分の WeekInfo 配列を生成
 * @param startWeekDate 開始となる週の月曜日
 * @param count 生成する週の数
 */
export function generatePastWeeks(
  startWeekDate: Date,
  count: number,
): WeekInfo[] {
  const weeks: WeekInfo[] = [];

  for (let i = 0; i < count; i++) {
    const weekStart = new Date(startWeekDate);
    weekStart.setDate(startWeekDate.getDate() - i * 7);
    weeks.push(createWeekInfo(weekStart));
  }

  return weeks;
}

/**
 * 週リストを月ごとにグループ化
 * 週の primaryMonth を基準にグループ化する
 */
export function groupWeeksByMonth(weeks: WeekInfo[]): MonthGroup[] {
  const groupMap = new Map<string, MonthGroup>();

  for (const week of weeks) {
    // primaryMonth を基準に月を決定
    // 週の最初の日の年と primaryMonth を使用
    const year = week.startDate.getFullYear();
    // primaryMonth が前年の月の場合を考慮
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

  // 配列に変換（既に時系列順）
  return Array.from(groupMap.values());
}
