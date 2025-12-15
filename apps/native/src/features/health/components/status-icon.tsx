import { Ionicons } from "@expo/vector-icons";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

type StatusIconProps = {
  ok: boolean;
};

export const StatusIcon = ({ ok }: StatusIconProps) => {
  return ok ? (
    <StyledIonicons
      name="checkmark-circle"
      size={24}
      className="text-success"
    />
  ) : (
    <StyledIonicons name="close-circle" size={24} className="text-danger" />
  );
};
