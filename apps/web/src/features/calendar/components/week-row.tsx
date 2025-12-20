"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { DayInfo, WeekInfo } from "../types";

/**
 * 曜日に応じたテキストカラークラスを取得
 * - 日曜日: 赤色 (text-red-500)
 * - 土曜日: 青色 (text-blue-500) - isWeekend が true かつ日曜でない場合
 * - 平日: 通常色 (text-gray-900)
 */
const getTextColorClass = (day: DayInfo): string => {
  const isSunday = day.date.getDay() === 0;
  if (isSunday) return "text-red-500";
  if (day.isWeekend) return "text-blue-500"; // 土曜日
  return "text-gray-900";
};

interface WeekDatesRowProps {
  days: DayInfo[];
  entryDates: string[];
}

const WeekDatesRow = ({ days, entryDates }: WeekDatesRowProps) => {
  return (
    <div className="flex items-center justify-between">
      {days.map((day) => {
        const hasEntry = entryDates.includes(day.dateString);
        return (
          <div
            key={day.dateString}
            className="flex w-8 items-center justify-center"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${hasEntry ? "border-2 border-[#4ECCDD]" : ""}`}
            >
              <span
                className={`text-sm ${getTextColorClass(day)} ${day.isToday ? "font-bold" : "font-medium"}`}
              >
                {day.day}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WeekContent = ({ imageUrl }: { imageUrl: string | null }) => {
  if (imageUrl === null) {
    return (
      <div className="mt-1 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        <Image
          src="/images/world-placeholder.png"
          alt="プレースホルダー"
          width={128}
          height={128}
          className="h-full w-full object-contain"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="mt-1 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
      <Image
        src={imageUrl}
        alt="週間ワールド"
        width={128}
        height={128}
        className="h-full w-full object-contain"
        unoptimized
      />
    </div>
  );
};

interface WeekRowProps {
  week: WeekInfo;
  entryDates: string[];
}

export const WeekRow = ({ week, entryDates }: WeekRowProps) => {
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
      <WeekDatesRow days={week.days} entryDates={entryDates} />
      <WeekContent imageUrl={week.imageUrl} />
    </button>
  );
};
