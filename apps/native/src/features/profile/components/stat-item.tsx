import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { PROFILE_COLORS } from "../lib/colors";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export interface StatItemProps {
  value: number;
  unit: string;
  label: string;
}

/**
 * 統計項目（単一）
 *
 * 数値、単位、ラベルを縦に表示。
 * ProfileStatsRow 等で使用。
 */
export const StatItem = ({ value, unit, label }: StatItemProps) => (
  <StyledView className="flex-1 items-center">
    <StyledView className="flex-row items-baseline">
      <StyledText
        className="font-bold text-2xl"
        style={{ color: PROFILE_COLORS.textPrimary }}
      >
        {value}
      </StyledText>
      <StyledText
        className="ml-0.5 text-sm"
        style={{ color: PROFILE_COLORS.textSecondary }}
      >
        {unit}
      </StyledText>
    </StyledView>
    <StyledText
      className="mt-1 text-xs"
      style={{ color: PROFILE_COLORS.textSecondary }}
    >
      {label}
    </StyledText>
  </StyledView>
);

/**
 * 縦の区切り線
 *
 * StatItem 間の区切りに使用。
 */
export const StatDivider = () => (
  <StyledView
    style={{
      width: 1,
      height: 40,
      backgroundColor: PROFILE_COLORS.divider,
    }}
  />
);
