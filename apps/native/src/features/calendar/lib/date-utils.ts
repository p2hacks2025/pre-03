import type { DayInfo, MonthGroup, WeekInfo } from "../types";

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

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

export function createWeekInfo(weekStartDate: Date): WeekInfo {
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
  };
}

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
