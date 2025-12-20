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

/** 年区切り線（月カラムの右側に表示） */
const YearSeparator = ({ year }: { year: number }) => {
  return (
    <div className="ml-4 flex h-full flex-shrink-0 flex-col items-center justify-center">
      <div className="h-full w-px bg-gray-300" />
      <span className="-rotate-90 whitespace-nowrap font-bold text-gray-500 text-sm">
        {year}年
      </span>
      <div className="h-full w-px bg-gray-300" />
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
    <div className="flex h-full flex-shrink-0">
      {/* 月カラム */}
      <div className="flex w-72 flex-shrink-0 flex-col">
        {/* 月ヘッダー */}
        <div className="mb-2 flex-shrink-0">
          <span className="font-bold text-2xl text-gray-900">
            {monthGroup.month}月
          </span>
        </div>

        {/* 週リスト */}
        <div className="flex flex-1 flex-col">
          {visibleWeeks.map((week) => (
            <WeekRow
              key={week.weekId}
              week={week}
              entryDates={monthGroup.entryDates}
            />
          ))}
        </div>
      </div>

      {/* 年区切り（この月の右側に表示） */}
      {showYearSeparator && <YearSeparator year={monthGroup.year} />}
    </div>
  );
};
