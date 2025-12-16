import { View } from "react-native";
import { withUniwind } from "uniwind";
import type { MonthGroup } from "../types";
import { MonthIndicator } from "./month-indicator";
import { WeekRow } from "./week-row";
import { YearHeader } from "./year-header";

const StyledView = withUniwind(View);

interface MonthSectionProps {
  monthGroup: MonthGroup;
  /** 年セパレーターを表示するか */
  showYearSeparator?: boolean;
}

export const MonthSection = ({
  monthGroup,
  showYearSeparator = false,
}: MonthSectionProps) => {
  return (
    <StyledView className="mb-4">
      {/* 年セパレーター（1月の上に表示） */}
      {showYearSeparator && <YearHeader year={monthGroup.year} />}

      <StyledView className="flex-row">
        {/* 左: 月インジケーター（縦長バー） */}
        <MonthIndicator month={monthGroup.month} />

        {/* 右: 週の一覧（古い順：上が古く、下が新しい） */}
        <StyledView className="flex-1">
          {[...monthGroup.weeks].reverse().map((week) => (
            <WeekRow key={week.weekId} week={week} />
          ))}
        </StyledView>
      </StyledView>
    </StyledView>
  );
};
