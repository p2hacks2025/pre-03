"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarOutline, RefreshOutline } from "react-ionicons";
import { Button, Spinner } from "@heroui/react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  // 初期スクロール位置を右端（現在の月）に設定
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && monthGroups.length > 0 && !hasInitialScrolled) {
      // requestAnimationFrameで描画完了を待ってからスクロール
      requestAnimationFrame(() => {
        scrollContainer.scrollLeft = scrollContainer.scrollWidth;
        setHasInitialScrolled(true);
      });
    }
  }, [monthGroups.length, hasInitialScrolled]);

  // 横スクロール無限ローディング（左端到達で過去の月をロード）
  // 初期スクロール完了後にのみオブザーバーを設定
  useEffect(() => {
    if (!hasInitialScrolled) return;

    const scrollContainer = scrollContainerRef.current;
    const observerElement = observerRef.current;
    if (!scrollContainer || !observerElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: scrollContainer,
        rootMargin: "0px 0px 0px 200px", // 左に200px余裕を持ってトリガー
        threshold: 0,
      },
    );
    observer.observe(observerElement);
    return () => observer.disconnect();
  }, [hasInitialScrolled, hasMore, isLoadingMore, loadMore]);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  if (isLoading && monthGroups.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Spinner size="lg" color="warning" />
        <p className="mt-4 text-gray-400">読み込み中...</p>
      </div>
    );
  }

  // 月グループを逆順にして古い月を左、新しい月を右に配置
  const reversedMonthGroups = [...monthGroups].reverse();

  return (
    <div className="flex h-full flex-col">
      <header className="z-10 flex flex-shrink-0 items-center justify-between border-gray-200 border-b bg-white/95 px-6 py-4 backdrop-blur">
        <div>
          <h1 className="font-bold text-gray-900 text-xl">カレンダー</h1>
          <p className="text-gray-400 text-sm">{formattedDate}</p>
        </div>
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
      </header>

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
          {/* 左端の監視要素（過去の月をロード） */}
          <div
            ref={observerRef}
            className="flex h-full w-8 flex-shrink-0 items-center justify-center"
          >
            {isLoadingMore && <Spinner size="sm" color="warning" />}
          </div>

          {/* 月グループを横並びで表示 */}
          {reversedMonthGroups.map((monthGroup, index) => {
            // 逆順なので、次の月グループ（元の配列で前）と年が違う場合に区切りを表示
            const nextMonthGroup = reversedMonthGroups[index + 1];
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

          {/* 右端のパディング */}
          <div className="w-4 flex-shrink-0" />
        </div>
      )}
    </div>
  );
}
