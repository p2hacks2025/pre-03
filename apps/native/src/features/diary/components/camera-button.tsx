import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);

interface CameraButtonProps {
  onPress: () => void;
  isDisabled?: boolean;
}

export const CameraButton = ({ onPress, isDisabled }: CameraButtonProps) => {
  return (
    <StyledPressable
      className="h-20 w-20 items-center justify-center rounded-xl bg-cyan-50 active:opacity-70"
      onPress={onPress}
      disabled={isDisabled}
    >
      <StyledView className="items-center justify-center">
        <StyledIonicons
          name="camera-outline"
          size={32}
          className={isDisabled ? "text-muted" : "text-cyan-500"}
        />
      </StyledView>
    </StyledPressable>
  );
};
