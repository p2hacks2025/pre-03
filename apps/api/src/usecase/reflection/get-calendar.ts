import type { DbClient } from "@packages/db";
import type {
  CalendarWeek,
  GetReflectionCalendarOutput,
} from "@packages/schema/reflection";
import { getEntryDatesByMonth } from "@/repository/user-post";
import { getUserProfileByUserId } from "@/repository/user-profile";
import { getWeeklyWorldsByDateRange } from "@/repository/weekly-world";
import { formatDateString } from "@/shared/date";
import { AppError } from "@/shared/error/app-error";

type GetReflectionCalendarDeps = { db: DbClient };
type GetReflectionCalendarInput = {
  userId: string;
  year: number;
  month: number;
};

/**
 * 「週開始日がその月内にある」週のみを返す
 * ISO 8601準拠: 週は月曜日始まり
 * UTCベースで日付を作成（DBはUTCで保存されているため）
 *
 * 例: 2025年11月（11/1が土曜日）
 *   - 11/1を含む週の月曜は10/27 → 10月なので含まない
 *   - 結果: [11/3, 11/10, 11/17, 11/24]
 *
 * 例: 2025年12月（12/1が月曜日）
 *   - 結果: [12/1, 12/8, 12/15, 12/22, 12/29]
 */
const getWeekStartDatesForMonth = (year: number, month: number): Date[] => {
  // UTCで日付を作成（タイムゾーンズレ防止）
  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));

  // その月内で最初の月曜日を探す
  const firstMonday = new Date(firstDayOfMonth);
  const firstDayOfWeek = firstMonday.getUTCDay();
  if (firstDayOfWeek !== 1) {
    // 月曜日でない場合、次の月曜日まで進める
    const daysUntilMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek;
    firstMonday.setUTCDate(firstMonday.getUTCDate() + daysUntilMonday);
  }

  // 月内の全月曜日をリスト
  const weekStarts: Date[] = [];
  const current = new Date(firstMonday);
  while (current.getUTCMonth() === month - 1) {
    weekStarts.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 7);
  }
  return weekStarts;
};

export const getReflectionCalendar = async (
  deps: GetReflectionCalendarDeps,
  input: GetReflectionCalendarInput,
): Promise<GetReflectionCalendarOutput> => {
  const { db } = deps;
  const { userId, year, month } = input;

  // プロフィール取得
  const profile = await getUserProfileByUserId(db, userId);
  if (!profile) {
    throw new AppError("NOT_FOUND", {
      message: "プロフィールが見つかりません",
    });
  }

  // 週開始日リスト
  const weekStartDates = getWeekStartDatesForMonth(year, month);

  // 週がない場合（極端なケース）は空配列を返す
  if (weekStartDates.length === 0) {
    return {
      year,
      month,
      weeks: [],
      entryDates: [],
    };
  }

  const firstWeekStart = weekStartDates[0];
  const lastWeekStart = weekStartDates[weekStartDates.length - 1];

  // トランザクション内で並列実行（読み取り一貫性確保）
  const result = await db.transaction(async (tx) => {
    const [weeklyWorlds, entryDateResults] = await Promise.all([
      getWeeklyWorldsByDateRange(tx, {
        profileId: profile.id,
        startDate: firstWeekStart,
        endDate: lastWeekStart,
      }),
      getEntryDatesByMonth(tx, { profileId: profile.id, year, month }),
    ]);
    return { weeklyWorlds, entryDateResults };
  });

  // Map変換でO(1)ルックアップ
  const worldsMap = new Map(
    result.weeklyWorlds.map((w) => [
      formatDateString(w.weekStartDate),
      w.weeklyWorldImageUrl,
    ]),
  );

  const weeks: CalendarWeek[] = weekStartDates.map((date) => {
    const dateStr = formatDateString(date);
    return {
      weekStartDate: dateStr,
      weeklyWorldImageUrl: worldsMap.get(dateStr) ?? null,
    };
  });

  const entryDates = result.entryDateResults
    .map((r) => formatDateString(r.date))
    .sort();

  return { year, month, weeks, entryDates };
};
