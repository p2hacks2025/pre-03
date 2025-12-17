import { Text, View } from "react-native";
import { withUniwind } from "uniwind";
import type { MonthGroup } from "../types";
import { WeekRow } from "./week-row";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

// --- 内部コンポーネント: YearHeader ---

const YearHeader = ({ year }: { year: number }) => {
  return (
    <StyledView className="py-2">
      <StyledText className="font-bold text-foreground text-xl">
        {year}年
      </StyledText>
    </StyledView>
  );
};

// --- 内部コンポーネント: MonthIndicator ---

const MonthIndicator = ({ month }: { month: number }) => {
  return (
    <StyledView className="w-14 items-center pt-1">
      <StyledText className="font-bold text-3xl text-foreground">
        {month + 1}
      </StyledText>
    </StyledView>
  );
};

// --- メインコンポーネント ---

interface MonthSectionProps {
  monthGroup: MonthGroup;
  showYearSeparator?: boolean;
}

export const MonthSection = ({
  monthGroup,
  showYearSeparator = false,
}: MonthSectionProps) => {
  return (
    <StyledView className="mb-4">
      {showYearSeparator && <YearHeader year={monthGroup.year} />}

      <StyledView className="flex-row">
        <MonthIndicator month={monthGroup.month} />

        <StyledView className="flex-1">
          {[...monthGroup.weeks].reverse().map((week) => (
            <WeekRow key={week.weekId} week={week} />
          ))}
        </StyledView>
      </StyledView>
    </StyledView>
  );
};
