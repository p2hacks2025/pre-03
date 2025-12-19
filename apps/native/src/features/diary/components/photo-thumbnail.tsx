import { Image } from "expo-image";
import { Pressable } from "react-native";
import { withUniwind } from "uniwind";

const StyledPressable = withUniwind(Pressable);
const StyledImage = withUniwind(
  Image as React.ComponentType<React.ComponentProps<typeof Image>>,
);

interface PhotoThumbnailProps {
  uri: string;
  onPress: () => void;
  isDisabled?: boolean;
}

export const PhotoThumbnail = ({
  uri,
  onPress,
  isDisabled,
}: PhotoThumbnailProps) => {
  return (
    <StyledPressable
      className="h-20 w-20 overflow-hidden rounded-xl bg-amber-100 active:opacity-70"
      onPress={onPress}
      disabled={isDisabled}
    >
      <StyledImage source={uri} className="h-full w-full" contentFit="cover" />
    </StyledPressable>
  );
};
