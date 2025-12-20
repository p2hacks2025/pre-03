import Image from "next/image";

import { FONT_FAMILY } from "@/lib/fonts";

import { formatAbsoluteTime } from "../lib/format-time";

import type { UserTimelineItemProps } from "./types";

export type { UserTimelineItemProps };

/**
 * 人間投稿用タイムラインアイテムコンポーネント
 *
 * 日記風のデザインで、絶対時間表示と画像添付に対応。
 *
 * @example
 * ```tsx
 * <UserTimelineItem
 *   content="今日は良い天気でした。"
 *   createdAt="2025-12-18T10:30:00.000Z"
 *   uploadImageUrl="https://example.com/image.png"
 *   author={{ username: "田中", avatarUrl: null }}
 * />
 * ```
 */
export const UserTimelineItem = ({
  content,
  createdAt,
  uploadImageUrl,
  index = 0,
}: UserTimelineItemProps) => {
  const formattedDate = formatAbsoluteTime(createdAt);

  return (
    <div
      className="animate-[fadeIn_200ms_ease-out_forwards] overflow-hidden rounded-md border border-[#A28758]"
      style={{ opacity: 0, animationDelay: `${index * 50}ms` }}
    >
      <div
        className="relative rounded-md p-5"
        style={{ backgroundColor: "#FFF4DE" }}
      >
        {/* インナーシャドウ効果（CSSで実現） */}
        <div
          className="pointer-events-none absolute inset-0 rounded-md"
          style={{ boxShadow: "inset 0 0 20px rgba(190, 166, 123, 0.4)" }}
        />

        {/* 日時表示 */}
        <p
          className="relative mb-1 text-black"
          style={{ fontFamily: FONT_FAMILY.ZEN_KURENAIDO }}
        >
          {formattedDate}
        </p>

        {/* 本文 */}
        <p
          className="relative whitespace-pre-wrap text-black leading-5"
          style={{ fontFamily: FONT_FAMILY.ZEN_KURENAIDO }}
        >
          {content}
        </p>

        {/* 添付画像 */}
        {uploadImageUrl && (
          <div className="relative mt-3 overflow-hidden rounded-lg">
            <Image
              src={uploadImageUrl}
              alt="添付画像"
              width={600}
              height={400}
              className="h-auto w-full object-cover"
              unoptimized
            />
          </div>
        )}
      </div>
    </div>
  );
};
