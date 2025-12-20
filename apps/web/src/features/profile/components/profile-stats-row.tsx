"use client";

import { useProfileStats } from "../hooks/use-profile-stats";
import { PROFILE_COLORS } from "../lib/colors";
import { StatDivider, StatItem } from "./stat-item";

/**
 * プロフィール統計情報（3列表示）
 *
 * 連続投稿日数 | 投稿総数 | 作られた世界の数
 */
export const ProfileStatsRow = () => {
  const { streakDays, totalPosts, worldCount } = useProfileStats();

  return (
    <div
      className="mt-4 rounded-xl py-3"
      style={{
        backgroundColor: PROFILE_COLORS.cardSecondary,
        boxShadow: `0 4px 8px ${PROFILE_COLORS.shadow}26`,
      }}
    >
      <div className="flex items-center">
        <StatItem value={streakDays} unit="日" label="連続" />
        <StatDivider />
        <StatItem value={totalPosts} unit="件" label="投稿" />
        <StatDivider />
        <StatItem value={worldCount} unit="個" label="世界" />
      </div>
    </div>
  );
};
