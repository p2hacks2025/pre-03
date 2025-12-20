"use client";

import {
  ChevronDownOutline,
  ChevronUpOutline,
  DocumentTextOutline,
} from "react-ionicons";
import { Spinner } from "@heroui/react";

import { UserTimelineItem } from "@/features/timeline";

import { useProfileEntries } from "../hooks/use-profile-entries";

export const EntryList = () => {
  const { entries, isLoading, error, sortOrder, toggleSortOrder } =
    useProfileEntries();

  const sortLabel = sortOrder === "newest" ? "新しい順" : "古い順";

  return (
    <div className="flex-1">
      {/* ソート切り替え */}
      <div className="flex justify-end px-6 py-3">
        <button
          type="button"
          onClick={toggleSortOrder}
          className="flex items-center text-gray-300 text-sm transition-colors hover:text-white"
        >
          <span>{sortLabel}</span>
          {sortOrder === "newest" ? (
            <ChevronDownOutline
              color="currentColor"
              width="16px"
              height="16px"
              cssClasses="ml-1"
            />
          ) : (
            <ChevronUpOutline
              color="currentColor"
              width="16px"
              height="16px"
              cssClasses="ml-1"
            />
          )}
        </button>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {/* エラー */}
      {error && !isLoading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-danger">{error}</p>
        </div>
      )}

      {/* 空状態 */}
      {!isLoading && !error && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <DocumentTextOutline
            color="#6B7280"
            width="48px"
            height="48px"
            cssClasses="mb-2"
          />
          <p className="text-gray-500">日記がありません</p>
        </div>
      )}

      {/* カードリスト */}
      {!isLoading && !error && entries.length > 0 && (
        <div className="flex flex-col gap-3 px-6 pt-1 pb-6">
          {entries.map((entry) => (
            <UserTimelineItem
              key={entry.id}
              content={entry.content}
              createdAt={entry.createdAt}
              uploadImageUrl={entry.uploadImageUrl}
              author={entry.author}
            />
          ))}
        </div>
      )}
    </div>
  );
};
