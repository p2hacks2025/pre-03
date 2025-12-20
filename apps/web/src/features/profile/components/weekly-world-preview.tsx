"use client";

import { Spinner } from "@heroui/react";
import Image from "next/image";

import { useCurrentWeekWorld } from "../hooks/use-current-week-world";
import { PROFILE_COLORS } from "../lib/colors";

/** 世界画像のサイズ */
const WORLD_IMAGE_SIZE = 280;

/** コンテナの高さ */
const CONTAINER_HEIGHT = 300;

/**
 * 今週の世界表示（浮遊アニメーション付き）
 *
 * - 世界画像 + 影
 * - ローディング、エラー、未生成状態のハンドリング
 */
export const WeeklyWorldPreview = () => {
  const { weeklyWorldImageUrl, isLoading, error, hasWorld, notFound } =
    useCurrentWeekWorld();

  // ローディング状態
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: CONTAINER_HEIGHT }}
      >
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div
        className="flex items-center justify-center px-6"
        style={{ height: CONTAINER_HEIGHT }}
      >
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  // 世界が見つからない（404）または存在しない
  if (notFound || !hasWorld) {
    return (
      <div
        className="flex items-center justify-center px-6"
        style={{ height: CONTAINER_HEIGHT }}
      >
        <p
          className="text-center"
          style={{ color: PROFILE_COLORS.textPrimary }}
        >
          今週の世界はまだ生成されていません
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height: CONTAINER_HEIGHT }}
    >
      {/* 影（世界画像の下に配置） */}
      <div className="absolute bottom-4 animate-shadow">
        <div className="h-4 w-32 rounded-full bg-black/30 blur-md" />
      </div>

      {/* 世界画像（浮遊） */}
      <div className="animate-float">
        {weeklyWorldImageUrl ? (
          <Image
            src={weeklyWorldImageUrl}
            alt="今週の世界"
            width={WORLD_IMAGE_SIZE}
            height={WORLD_IMAGE_SIZE}
            className="object-contain"
            style={{
              width: WORLD_IMAGE_SIZE,
              height: WORLD_IMAGE_SIZE,
            }}
            unoptimized
          />
        ) : (
          <div
            className="flex items-center justify-center bg-gray-200"
            style={{
              width: WORLD_IMAGE_SIZE,
              height: WORLD_IMAGE_SIZE,
            }}
          >
            <span style={{ color: PROFILE_COLORS.textSecondary }}>
              画像なし
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-shadow {
          animation: shadowPulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
