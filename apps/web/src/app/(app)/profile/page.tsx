"use client";

import { useEffect } from "react";
import { PulseOutline } from "react-ionicons";
import { Button } from "@heroui/react";
import Link from "next/link";

import { usePageHeader } from "@/contexts/page-header-context";
import { ProfileCard, WeeklyWorldPreview } from "@/features/profile";
import { PROFILE_COLORS } from "@/features/profile/lib/colors";

export default function ProfilePage() {
  const { setHeader } = usePageHeader();

  useEffect(() => {
    setHeader({
      title: "プロフィール",
      rightContent: (
        <Button as={Link} href="/health" isIconOnly variant="light">
          <PulseOutline color="#9CA3AF" width="20px" height="20px" />
        </Button>
      ),
    });
  }, [setHeader]);

  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* 背景の円（装飾）- カードの下部分のみをカバー */}
      <div
        className="-translate-x-1/2 pointer-events-none absolute left-1/2"
        style={{
          top: "55%",
          width: "200vw",
          height: "200vw",
          borderRadius: "50%",
          backgroundColor: PROFILE_COLORS.background,
          zIndex: 0,
        }}
      />

      {/* メインコンテンツ */}
      <div className="relative z-10 mx-auto max-w-2xl px-4">
        {/* プロフィールカード */}
        <div className="flex justify-center pt-12">
          <ProfileCard />
        </div>

        {/* 今週の世界 */}
        <div className="mt-0 flex justify-center">
          <WeeklyWorldPreview />
        </div>
      </div>
    </div>
  );
}
