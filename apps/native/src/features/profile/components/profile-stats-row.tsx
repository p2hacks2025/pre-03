import { View } from "react-native";
import { withUniwind } from "uniwind";

import { useProfileStats } from "../hooks";
import { PROFILE_COLORS } from "../lib/colors";
import { StatDivider, StatItem } from "./stat-item";

const StyledView = withUniwind(View);

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
        backgroundColor: PROFILE_COLORS.cardSecondary,
        shadowColor: PROFILE_COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <StyledView className="flex-row items-center">
        <StatItem value={streakDays} unit="日" label="連続" />
        <StatDivider />
        <StatItem value={totalPosts} unit="件" label="投稿" />
        <StatDivider />
        <StatItem value={worldCount} unit="個" label="世界" />
      </StyledView>
    </StyledView>
  );
};
