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
  imageUrl: string | null; // 週の画像URL（nullの場合はデモ画像）
}

/** 週データの型（API/モック形式） */
export interface CalendarWeekData {
  weekId: string; // 週識別子 "YYYY-MM-DD"
  month: number; // 0-11
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  imageUrl: string | null; // null = デモ画像使用
}

export interface MonthGroup {
  monthId: string; // "YYYY-MM"
  month: number; // 0-11
  year: number;
  weeks: WeekInfo[];
}
