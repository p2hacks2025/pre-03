/**
 * 日付情報
 */
export interface DayInfo {
  /** 日付オブジェクト */
  date: Date;
  /** 日 (1-31) */
  day: number;
  /** 月 (0-11) */
  month: number;
  /** 年 */
  year: number;
  /** 週末かどうか (土曜・日曜) */
  isWeekend: boolean;
  /** 今日かどうか */
  isToday: boolean;
  /** ISO形式の日付文字列 "YYYY-MM-DD" */
  dateString: string;
}

/**
 * 週情報
 */
export interface WeekInfo {
  /** 週の開始日 (日曜日) の ISO 文字列 "YYYY-MM-DD" - ナビゲーションのID */
  weekId: string;
  /** 週を構成する7日間 */
  days: DayInfo[];
  /** この週に含まれる月のリスト (月またぎの場合複数) */
  months: number[];
  /** 表示用の主要な月 (最も多くの日が属する月) */
  primaryMonth: number;
  /** 週の開始日 */
  startDate: Date;
  /** 週の終了日 */
  endDate: Date;
}

/**
 * 月ごとにグループ化された週
 */
export interface MonthGroup {
  /** 月のID "YYYY-MM" */
  monthId: string;
  /** 月 (0-11) */
  month: number;
  /** 年 */
  year: number;
  /** この月に属する週のリスト */
  weeks: WeekInfo[];
}
