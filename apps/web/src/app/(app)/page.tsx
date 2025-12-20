"use client";

import { useEffect, useMemo, useRef } from "react";
import { DocumentTextOutline, RefreshOutline } from "react-ionicons";
import { Button, Spinner } from "@heroui/react";

import { usePageHeader } from "@/contexts/page-header-context";
import { Timeline, useTimeline } from "@/features/timeline";

export default function HomePage() {
  const {
    entries,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    lastBatchStartIndex,
    refresh,
    fetchMore,
  } = useTimeline();
  const { setHeader } = usePageHeader();
  const observerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  const rightContent = useMemo(
    () => (
      <Button
        isIconOnly
        variant="light"
        onPress={refresh}
        isDisabled={isLoading}
      >
        <RefreshOutline
          color="#9CA3AF"
          width="20px"
          height="20px"
          cssClasses={isLoading ? "animate-spin" : ""}
        />
      </Button>
    ),
    [isLoading, refresh],
  );

  useEffect(() => {
    setHeader({
      title: "新世界の声",
      subtitle: formattedDate,
      rightContent,
    });
  }, [setHeader, formattedDate, rightContent]);

  // 無限スクロール
  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          fetchMore();
        }
      },
      { threshold: 0.5, root: scrollContainer },
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, fetchMore]);

  // 初回fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Spinner size="lg" color="warning" />
        <p className="mt-4 text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-8">
      {error && (
        <div className="mx-4 mt-4 rounded-lg bg-danger/10 p-4 text-center">
          <p className="text-danger">{error}</p>
          <Button
            size="sm"
            color="danger"
            variant="light"
            onPress={refresh}
            className="mt-2"
          >
            再試行
          </Button>
        </div>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <DocumentTextOutline color="#4B5563" width="48px" height="48px" />
          <p className="mt-4 text-center text-gray-400">
            まだ投稿がありません
            <br />
            最初の日記を書いてみましょう
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <Timeline items={entries} batchStartIndex={lastBatchStartIndex} />
      )}

      <div
        ref={observerRef}
        className={isFetchingMore ? "h-0 overflow-hidden" : "h-4"}
      />

      {isFetchingMore && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" color="warning" />
        </div>
      )}
    </div>
  );
}
