"use client";

import { WeekRow } from "./week-row";

import type { MonthGroup } from "../types";

/**
 * 週が未来かどうか判定
 * 今週（今日を含む週）は表示、来週以降は非表示
 */
const isFutureWeek = (weekId: string): boolean => {
  const weekStartDate = new Date(`${weekId}T00:00:00`);
  const today = new Date();

  // 今週の月曜日を計算
  const currentWeekMonday = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 日曜なら-6、それ以外は1-曜日
  currentWeekMonday.setDate(today.getDate() + diff);
  currentWeekMonday.setHours(0, 0, 0, 0);

  return weekStartDate > currentWeekMonday;
};

const YearHeader = ({ year }: { year: number }) => {
  return (
    <div className="py-2">
      <p className="text-center font-bold text-white text-xl">{year}年</p>
    </div>
  );
};

interface CalendarProps {
  monthGroup: MonthGroup;
  showYearSeparator?: boolean;
}

export const Calendar = ({
  monthGroup,
  showYearSeparator = false,
}: CalendarProps) => {
  // 未来の週をフィルタリング
  const visibleWeeks = monthGroup.weeks.filter(
    (week) => !isFutureWeek(week.weekId),
  );

  // 表示する週がない場合は何も表示しない
  if (visibleWeeks.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      {showYearSeparator && <YearHeader year={monthGroup.year} />}

      <div>
        {visibleWeeks.map((week, index) => (
          <WeekRow
            key={week.weekId}
            week={week}
            showMonthIndicator={index === 0}
            month={monthGroup.month}
            entryDates={monthGroup.entryDates}
          />
        ))}
      </div>
    </div>
  );
};
