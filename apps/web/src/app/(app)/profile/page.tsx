"use client";

import { useState } from "react";
import { LogOutOutline, RefreshOutline } from "react-ionicons";
import { Button, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import {
  EntryList,
  ProfileHeader,
  useProfileEntries,
} from "@/features/profile";

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { refresh, isLoading } = useProfileEntries();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm("ログアウトしますか？");
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between border-gray-200 border-b bg-white/95 px-6 py-4 backdrop-blur">
        <h1 className="font-bold text-gray-900 text-xl">プロフィール</h1>
        <div className="flex items-center gap-2">
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
          <Button
            isIconOnly
            variant="light"
            onPress={handleLogout}
            isDisabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Spinner size="sm" />
            ) : (
              <LogOutOutline color="#EF4444" width="20px" height="20px" />
            )}
          </Button>
        </div>
      </header>

      {/* プロフィールヘッダー（ゴールド背景） */}
      <div style={{ backgroundColor: "#C4A86C" }}>
        <ProfileHeader />
      </div>

      {/* エントリー一覧 */}
      <EntryList />
    </div>
  );
}
