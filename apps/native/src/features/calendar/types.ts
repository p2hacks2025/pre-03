export interface DayInfo {
  date: Date;
  day: number;
  month: number; // 0-11
  year: number;
  isWeekend: boolean;
  isToday: boolean;
  dateString: string; // "YYYY-MM-DD"
}

export interface WeekInfo {
  weekId: string; // 週の開始日 "YYYY-MM-DD"
  days: DayInfo[];
  primaryMonth: number; // 最も多くの日が属する月
  startDate: Date;
  endDate: Date;
}

export interface MonthGroup {
  monthId: string; // "YYYY-MM"
  month: number; // 0-11
  year: number;
  weeks: WeekInfo[];
}
