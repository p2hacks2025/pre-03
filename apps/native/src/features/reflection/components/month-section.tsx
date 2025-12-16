import { View } from "react-native";
import { withUniwind } from "uniwind";
import type { MonthGroup } from "../types";
import { MonthIndicator } from "./month-indicator";
import { WeekRow } from "./week-row";

const StyledView = withUniwind(View);

interface MonthSectionProps {
  monthGroup: MonthGroup;
}

export const MonthSection = ({ monthGroup }: MonthSectionProps) => {
  return (
    <StyledView className="mb-4 flex-row">
      {/* 左: 月インジケーター（縦長バー） */}
      <MonthIndicator month={monthGroup.month} />

      {/* 右: 週の一覧 */}
      <StyledView className="flex-1">
        {monthGroup.weeks.map((week) => (
          <WeekRow key={week.weekId} week={week} />
        ))}
      </StyledView>
    </StyledView>
  );
};
