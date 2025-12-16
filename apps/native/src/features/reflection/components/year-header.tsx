import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

interface YearHeaderProps {
  year: number;
}

export const YearHeader = ({ year }: YearHeaderProps) => {
  return (
    <StyledView className="py-2">
      <StyledText className="font-bold text-foreground text-xl">
        {year}年
      </StyledText>
    </StyledView>
  );
};
