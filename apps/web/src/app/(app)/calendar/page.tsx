"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { CalendarOutline, RefreshOutline } from "react-ionicons";
import { Button, Spinner } from "@heroui/react";

import { usePageHeader } from "@/contexts/page-header-context";
import { Calendar, useCalendar } from "@/features/calendar";

export default function CalendarPage() {
  const {
    monthGroups,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useCalendar();
  const { setHeader } = usePageHeader();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      title: "カレンダー",
      subtitle: formattedDate,
      rightContent,
    });
  }, [setHeader, formattedDate, rightContent]);

  // 横スクロール無限ローディング（右端到達で過去の月をロード）
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || isLoadingMore) return;

    // 右端までの残り距離を計算
    const scrollRight =
      container.scrollWidth - container.scrollLeft - container.clientWidth;

    // 右端から200px以内になったらロード
    if (scrollRight < 200) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  // スクロールイベントの登録
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (isLoading && monthGroups.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Spinner size="lg" color="warning" />
        <p className="mt-4 text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
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

      {!isLoading && !error && monthGroups.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <CalendarOutline color="#4B5563" width="48px" height="48px" />
          <p className="mt-4 text-center text-gray-400">
            カレンダーデータがありません
          </p>
        </div>
      )}

      {monthGroups.length > 0 && (
        <div
          ref={scrollContainerRef}
          className="flex flex-1 overflow-x-auto overflow-y-hidden"
        >
          {/* 左端のパディング */}
          <div className="w-4 flex-shrink-0" />

          {/* 月グループを横並びで表示（新しい月が左、古い月が右） */}
          {monthGroups.map((monthGroup, index) => {
            // 次の月グループ（より古い月）と年が違う場合に区切りを表示
            const nextMonthGroup = monthGroups[index + 1];
            const showYearSeparator =
              nextMonthGroup && nextMonthGroup.year !== monthGroup.year;

            return (
              <div key={monthGroup.monthId} className="flex-shrink-0 p-4">
                <Calendar
                  monthGroup={monthGroup}
                  showYearSeparator={showYearSeparator}
                />
              </div>
            );
          })}

          {/* 右端のローディング表示 */}
          <div className="flex h-full w-8 flex-shrink-0 items-center justify-center">
            {isLoadingMore && <Spinner size="sm" color="warning" />}
          </div>
        </div>
      )}
    </div>
  );
}
