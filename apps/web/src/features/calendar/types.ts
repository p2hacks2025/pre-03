export interface DayInfo {
  date: Date;
  day: number;
  isWeekend: boolean;
  isToday: boolean;
  dateString: string; // "YYYY-MM-DD"
}

export interface WeekInfo {
  weekId: string;
  days: DayInfo[];
  imageUrl: string | null;
}

export interface MonthGroup {
  monthId: string; // "YYYY-MM"
  month: number;
  year: number;
  weeks: WeekInfo[];
  entryDates: string[]; // "YYYY-MM-DD" 形式の投稿日配列
}
