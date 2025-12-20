"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { DayInfo, WeekInfo } from "../types";

/**
 * 曜日に応じたテキストカラークラスを取得
 * - 日曜日: 赤色 (text-red-500)
 * - 土曜日: 青色 (text-blue-500) - isWeekend が true かつ日曜でない場合
 * - 平日: 通常色 (text-white)
 */
const getTextColorClass = (day: DayInfo): string => {
  const isSunday = day.date.getDay() === 0;
  if (isSunday) return "text-red-500";
  if (day.isWeekend) return "text-blue-500"; // 土曜日
  return "text-white";
};

const MonthIndicator = ({ month }: { month: number }) => {
  return (
    <div className="flex w-16 items-start justify-center">
      <span className="font-bold text-2xl text-white">{month}月</span>
    </div>
  );
};

interface WeekDatesRowProps {
  days: DayInfo[];
  showMonthIndicator?: boolean;
  month?: number;
  entryDates: string[];
}

const WeekDatesRow = ({
  days,
  showMonthIndicator = false,
  month,
  entryDates,
}: WeekDatesRowProps) => {
  return (
    <div className="flex items-center">
      {showMonthIndicator && month !== undefined ? (
        <MonthIndicator month={month} />
      ) : (
        <div className="w-16" />
      )}
      <div className="flex flex-1 justify-between px-4">
        {days.map((day) => {
          const hasEntry = entryDates.includes(day.dateString);
          return (
            <div
              key={day.dateString}
              className="flex w-8 items-center justify-center"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${hasEntry ? "border-2 border-[#4ECCDD]" : ""}`}
              >
                <span
                  className={`text-base ${getTextColorClass(day)} ${day.isToday ? "font-bold" : "font-medium"}`}
                >
                  {day.day}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekContent = ({ imageUrl }: { imageUrl: string | null }) => {
  if (imageUrl === null) {
    return (
      <div className="mt-2 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-[#2C2C2E]">
        <Image
          src="/images/world-placeholder.png"
          alt="プレースホルダー"
          width={192}
          height={192}
          className="h-full w-full object-contain"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="mt-2 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-[#2C2C2E]">
      <Image
        src={imageUrl}
        alt="週間ワールド"
        width={192}
        height={192}
        className="h-full w-full object-contain"
        unoptimized
      />
    </div>
  );
};

interface WeekRowProps {
  week: WeekInfo;
  showMonthIndicator?: boolean;
  month?: number;
  entryDates: string[];
}

export const WeekRow = ({
  week,
  showMonthIndicator = false,
  month,
  entryDates,
}: WeekRowProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/reflection/${week.weekId}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mb-2 w-full text-left transition-opacity hover:opacity-80"
    >
      <WeekDatesRow
        days={week.days}
        showMonthIndicator={showMonthIndicator}
        month={month}
        entryDates={entryDates}
      />
      <div className="ml-16">
        <WeekContent imageUrl={week.imageUrl} />
      </div>
    </button>
  );
};
