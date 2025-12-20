"use client";

import { PROFILE_COLORS } from "../lib/colors";

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
  <div className="flex flex-1 flex-col items-center">
    <div className="flex items-baseline">
      <span
        className="font-bold text-2xl"
        style={{ color: PROFILE_COLORS.textPrimary }}
      >
        {value}
      </span>
      <span
        className="ml-0.5 text-sm"
        style={{ color: PROFILE_COLORS.textSecondary }}
      >
        {unit}
      </span>
    </div>
    <span
      className="mt-1 text-xs"
      style={{ color: PROFILE_COLORS.textSecondary }}
    >
      {label}
    </span>
  </div>
);

/**
 * 縦の区切り線
 *
 * StatItem 間の区切りに使用。
 */
export const StatDivider = () => (
  <div
    style={{
      width: 1,
      height: 40,
      backgroundColor: PROFILE_COLORS.divider,
    }}
  />
);
