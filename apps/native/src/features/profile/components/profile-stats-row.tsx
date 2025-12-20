import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { useProfileStats } from "../hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

// カラー定義
const COLORS = {
  divider: "#E5E5E5",
  valueText: "#333333",
  labelText: "#888888",
  cardBackground: "#F1F1F1",
};

interface StatItemProps {
  value: number;
  unit: string;
  label: string;
}

/**
 * 統計項目（単一）
 */
const StatItem = ({ value, unit, label }: StatItemProps) => (
  <StyledView className="flex-1 items-center">
    <StyledView className="flex-row items-baseline">
      <StyledText
        className="font-bold text-2xl"
        style={{ color: COLORS.valueText }}
      >
        {value}
      </StyledText>
      <StyledText
        className="ml-0.5 text-sm"
        style={{ color: COLORS.labelText }}
      >
        {unit}
      </StyledText>
    </StyledView>
    <StyledText className="mt-1 text-xs" style={{ color: COLORS.labelText }}>
      {label}
    </StyledText>
  </StyledView>
);

/**
 * 縦の区切り線
 */
const Divider = () => (
  <StyledView
    style={{
      width: 1,
      height: 40,
      backgroundColor: COLORS.divider,
    }}
  />
);

/**
 * プロフィール統計情報（3列表示）
 *
 * 連続投稿日数 | 投稿総数 | 作られた世界の数
 */
export const ProfileStatsRow = () => {
  const { streakDays, totalPosts, worldCount } = useProfileStats();

  return (
    <StyledView
      className="mt-4 rounded-xl py-3"
      style={{
        backgroundColor: COLORS.cardBackground,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <StyledView className="flex-row items-center">
        <StatItem value={streakDays} unit="日" label="連続" />
        <Divider />
        <StatItem value={totalPosts} unit="件" label="投稿" />
        <Divider />
        <StatItem value={worldCount} unit="個" label="世界" />
      </StyledView>
    </StyledView>
  );
};
