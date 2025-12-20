"use client";

import { useEffect } from "react";
import { Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { DiaryModalProvider } from "@/contexts/diary-modal-context";
import { PageHeaderProvider } from "@/contexts/page-header-context";
import { DiaryModal } from "@/features/diary";
import { PopupOverlay, useDailyPopup } from "@/features/popup";
import { useGlobalShortcuts } from "@/features/shortcuts";

import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";

/**
 * 日次ポップアップチェックを行うコンポーネント
 */
const DailyPopupChecker = () => {
  useDailyPopup();
  return null;
};

/**
 * グローバルキーボードショートカットを有効化するコンポーネント
 */
const GlobalShortcutsHandler = () => {
  useGlobalShortcuts();
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
    <DiaryModalProvider>
      <PageHeaderProvider>
        <div className="flex min-h-screen bg-white">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-auto">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <DailyPopupChecker />
          <PopupOverlay />
          <DiaryModal />
          <GlobalShortcutsHandler />
        </div>
      </PageHeaderProvider>
    </DiaryModalProvider>
  );
}
