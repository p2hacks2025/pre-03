"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronBackOutline, ChevronForwardOutline } from "react-ionicons";
import { Button, Spinner } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { usePageHeader } from "@/contexts/page-header-context";
import {
  DetailDiary,
  DetailTabs,
  DetailTimeline,
  type TabType,
  useWeeklyWorld,
  useWeekNavigation,
  WorldViewer,
} from "@/features/reflection";

export default function ReflectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const weekId = params.week as string;
  const { setHeader } = usePageHeader();

  const [activeTab, setActiveTab] = useState<TabType>("diary");

  const {
    weeklyWorld,
    userPosts,
    aiPosts,
    isLoading,
    error,
    notFound,
    prefetchAdjacent,
  } = useWeeklyWorld(weekId);

  const {
    canGoPrev,
    canGoNext,
    prevWeekStartDate,
    nextWeekStartDate,
    startDate,
    endDate,
  } = useWeekNavigation(weekId);

  const leftContent = useMemo(
    () => (
      <Button
        isIconOnly
        variant="light"
        isDisabled={!canGoPrev}
        onPress={() => router.push(`/reflection/${prevWeekStartDate}`)}
      >
        <ChevronBackOutline
          color={canGoPrev ? "#9CA3AF" : "#D1D5DB"}
          width="24px"
          height="24px"
        />
      </Button>
    ),
    [canGoPrev, prevWeekStartDate, router],
  );

  const rightContent = useMemo(
    () => (
      <Button
        isIconOnly
        variant="light"
        isDisabled={!canGoNext}
        onPress={() => router.push(`/reflection/${nextWeekStartDate}`)}
      >
        <ChevronForwardOutline
          color={canGoNext ? "#9CA3AF" : "#D1D5DB"}
          width="24px"
          height="24px"
        />
      </Button>
    ),
    [canGoNext, nextWeekStartDate, router],
  );

  useEffect(() => {
    setHeader({
      title: `${startDate} - ${endDate}`,
      leftContent,
      rightContent,
    });
  }, [setHeader, startDate, endDate, leftContent, rightContent]);

  // 初回レンダリング後にプリフェッチ
  useEffect(() => {
    if (!isLoading && weeklyWorld) {
      prefetchAdjacent();
    }
  }, [isLoading, weeklyWorld, prefetchAdjacent]);

  // 日記データをDetailDiary用の形式に変換
  const diaryEntries = userPosts.map((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    uploadImageUrl: post.uploadImageUrl,
  }));

  // AIポストをDetailTimeline用の形式に変換
  const timelineItems = aiPosts.map((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    uploadImageUrl: post.imageUrl,
    author: {
      username: post.aiProfile.username,
      avatarUrl: post.aiProfile.avatarUrl,
    },
  }));

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Spinner size="lg" color="warning" />
        <p className="mt-4 text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-danger">{error}</p>
        <Button
          as={Link}
          href="/calendar"
          color="warning"
          variant="light"
          className="mt-4"
        >
          カレンダーに戻る
        </Button>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-gray-400">この週のデータはありません</p>
        <Button
          as={Link}
          href="/calendar"
          color="warning"
          variant="light"
          className="mt-4"
        >
          カレンダーに戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-2xl">
          {/* ワールドビューア */}
          <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-4">
            <WorldViewer imageUrl={weeklyWorld?.weeklyWorldImageUrl ?? null} />
          </div>

          {/* タブ */}
          <DetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* タブコンテンツ */}
          <div className="min-h-[200px]">
            {activeTab === "diary" ? (
              <DetailDiary diaryEntries={diaryEntries} />
            ) : (
              <DetailTimeline timelineItems={timelineItems} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
