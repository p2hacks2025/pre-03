import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

interface MonthIndicatorProps {
  /** 月 (0-11) */
  month: number;
}

export const MonthIndicator = ({ month }: MonthIndicatorProps) => {
  return (
    <StyledView className="w-14 items-center pt-1">
      <StyledText className="font-bold text-3xl text-foreground">
        {month + 1}
      </StyledText>
    </StyledView>
  );
};
