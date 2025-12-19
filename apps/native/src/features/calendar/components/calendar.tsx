import { Text, View } from "react-native";
import { withUniwind } from "uniwind";
import type { MonthGroup } from "../types";
import { WeekRow } from "./week-row";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

const YearHeader = ({ year }: { year: number }) => {
  return (
    <StyledView className="py-2">
      <StyledText className="text-center font-bold text-foreground text-xl">
        {year}年
      </StyledText>
    </StyledView>
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
  return (
    <StyledView className="mb-4">
      {showYearSeparator && <YearHeader year={monthGroup.year} />}

      <StyledView>
        {monthGroup.weeks.map((week, index) => (
          <WeekRow
            key={week.weekId}
            week={week}
            showMonthIndicator={index === 0}
            month={monthGroup.month}
            entryDates={monthGroup.entryDates}
          />
        ))}
      </StyledView>
    </StyledView>
  );
};
