"use client";

import { LogOutOutline } from "react-ionicons";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePageHeader } from "@/contexts/page-header-context";

export const Header = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { title, subtitle, leftContent, rightContent } = usePageHeader();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-gray-200 border-b bg-white px-6">
      {/* 左側: カスタムコンテンツ or タイトル */}
      <div className="flex items-center gap-3">
        {leftContent}
        <div className="flex flex-col">
          {title && (
            <h1 className="font-bold text-gray-900 text-xl">{title}</h1>
          )}
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
      </div>

      {/* 右側: ページ固有アクション + ログアウト */}
      <div className="flex items-center gap-2">
        {rightContent}
        <Button
          variant="light"
          onPress={handleLogout}
          startContent={
            <LogOutOutline color="#EF4444" width="20px" height="20px" />
          }
          className="text-red-500"
        >
          ログアウト
        </Button>
      </div>
    </header>
  );
};
