import { Text, View } from "react-native";
import { withUniwind } from "uniwind";
import type { DayInfo } from "../types";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

interface WeekDatesRowProps {
  days: DayInfo[];
}

export const WeekDatesRow = ({ days }: WeekDatesRowProps) => {
  return (
    <StyledView className="flex-row justify-between px-2">
      {days.map((day) => (
        <StyledView key={day.dateString} className="w-8 items-center">
          <StyledText
            className={`text-base ${
              day.isWeekend ? "text-accent" : "text-foreground"
            } ${day.isToday ? "font-bold" : "font-medium"}`}
          >
            {day.day}
          </StyledText>
        </StyledView>
      ))}
    </StyledView>
  );
};
