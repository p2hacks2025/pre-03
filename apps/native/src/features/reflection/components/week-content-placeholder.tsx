import { Image, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledImage = withUniwind(Image);

interface WeekContentPlaceholderProps {
  weekId: string;
}

export const WeekContentPlaceholder = ({
  weekId: _weekId,
}: WeekContentPlaceholderProps) => {
  return (
    <StyledView className="mt-2 h-48 items-center justify-center overflow-hidden rounded-lg bg-surface-secondary">
      <StyledImage
        source={require("../../../../assets/demo/demo-sekai.png")}
        className="h-full w-full"
        resizeMode="contain"
      />
    </StyledView>
  );
};
