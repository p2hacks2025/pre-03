"use client";

import { useEffect } from "react";
import { Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { PopupOverlay, useDailyPopup } from "@/features/popup";

import { Sidebar } from "./_components/sidebar";

/**
 * 日次ポップアップチェックを行うコンポーネント
 */
const DailyPopupChecker = () => {
  useDailyPopup();
  return null;
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner size="lg" color="warning" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-400">リダイレクト中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <DailyPopupChecker />
      <PopupOverlay />
    </div>
  );
}
