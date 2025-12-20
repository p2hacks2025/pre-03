import { Avatar } from "@heroui/react";
import Image from "next/image";

import { formatRelativeTime } from "../lib/format-time";

import type { AiTimelineItemProps } from "./types";

export type { AiTimelineItemProps };

/**
 * AI投稿用タイムラインアイテムコンポーネント
 *
 * SNS風のデザインで、アバター表示と相対時間表示に対応。
 *
 * @example
 * ```tsx
 * <AiTimelineItem
 *   content="AIが生成したコンテンツです。"
 *   createdAt="2025-12-18T10:30:00.000Z"
 *   uploadImageUrl="https://example.com/image.png"
 *   author={{ username: "AIアシスタント", avatarUrl: "https://example.com/avatar.png" }}
 * />
 * ```
 */
export const AiTimelineItem = ({
  content,
  createdAt,
  uploadImageUrl,
  author,
}: AiTimelineItemProps) => {
  const timeAgo = formatRelativeTime(createdAt);

  return (
    <div className="flex gap-3 rounded-md border-4 border-gray-300 bg-gray-100 p-4">
      {/* 左側: アバター */}
      <div className="shrink-0">
        <Avatar
          size="md"
          name={author.username}
          src={author.avatarUrl ?? undefined}
          showFallback
        />
      </div>

      {/* 右側: コンテンツエリア */}
      <div className="min-w-0 flex-1">
        {/* ヘッダー: ユーザー名と経過時間 */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base text-gray-900">
            {author.username}
          </span>
          <span className="text-gray-400 text-xs">{timeAgo}</span>
        </div>

        {/* 投稿本文 */}
        <p className="whitespace-pre-wrap text-gray-900 text-sm leading-5">
          {content}
        </p>

        {/* 添付画像 */}
        {uploadImageUrl && (
          <div className="mt-3 overflow-hidden rounded-lg">
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
