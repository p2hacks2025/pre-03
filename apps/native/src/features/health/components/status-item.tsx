import { Ionicons } from "@expo/vector-icons";
import { Chip } from "heroui-native";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { withUniwind } from "uniwind";
import { StatusIcon } from "./status-icon";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledIonicons = withUniwind(Ionicons);

type StatusItemProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  message: string;
  ok?: boolean;
  badge?: {
    label: string;
    color: "success" | "default" | "warning";
  };
};

export const StatusItem = ({
  icon,
  title,
  message,
  ok,
  badge,
}: StatusItemProps) => {
  return (
    <StyledView className="flex-row items-center justify-between p-4">
      <StyledView className="flex-1 flex-row items-center gap-3">
        <StyledIonicons name={icon} size={18} className="text-muted" />
        <StyledView className="flex-1">
          <StyledText className="font-medium text-foreground text-sm">
            {title}
          </StyledText>
          <StyledText className="text-muted text-xs">{message}</StyledText>
        </StyledView>
      </StyledView>
      {ok !== undefined && <StatusIcon ok={ok} />}
      {badge && (
        <StyledView className="items-center justify-center">
          <Chip size="sm" variant="soft" color={badge.color}>
            <Chip.Label>{badge.label}</Chip.Label>
          </Chip>
        </StyledView>
      )}
    </StyledView>
  );
};
