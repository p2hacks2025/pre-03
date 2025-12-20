"use client";

import { clientLogger as logger } from "@/lib/logger-client";

import { PROFILE_COLORS } from "../lib/colors";

/**
 * 「今の世界をシェア」ボタン
 *
 * タップ時はログを出力するのみ（将来的にシェア機能を実装）
 */
export const ShareWorldButton = () => {
  const handlePress = () => {
    logger.info("Share button pressed");
  };

  return (
    <div className="mt-4 flex justify-center">
      <button
        type="button"
        className="rounded-xl px-10 py-3 transition-opacity hover:opacity-80 active:opacity-70"
        style={{ backgroundColor: PROFILE_COLORS.goldButton }}
        onClick={handlePress}
      >
        <span
          className="whitespace-pre-line text-center font-bold text-lg"
          style={{
            color: PROFILE_COLORS.textWhite,
            lineHeight: "1.5",
          }}
        >
          今の世界を{"\n"}シェア
        </span>
      </button>
    </div>
  );
};
