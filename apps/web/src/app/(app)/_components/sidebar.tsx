"use client";

import {
  CalendarOutline,
  CreateOutline,
  HomeOutline,
  PersonOutline,
} from "react-ionicons";
import { Button } from "@heroui/react";
import { usePathname } from "next/navigation";

import { useDiaryModal } from "@/contexts/diary-modal-context";

import { SidebarItem } from "./sidebar-item";

export const Sidebar = () => {
  const pathname = usePathname();
  const { open: openDiaryModal } = useDiaryModal();

  // アクティブ状態に応じたアイコン色
  const getIconColor = (href: string) =>
    pathname === href ? "#a07a2e" : "#9CA3AF";

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-gray-200 border-r bg-white">
      <div className="flex h-16 items-center px-4">
        <h1 className="font-bold text-gray-900 text-lg">新世界の声</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <SidebarItem
          href="/"
          icon={
            <HomeOutline color={getIconColor("/")} width="20px" height="20px" />
          }
          label="ホーム"
        />
        <SidebarItem
          href="/calendar"
          icon={
            <CalendarOutline
              color={getIconColor("/calendar")}
              width="20px"
              height="20px"
            />
          }
          label="振り返り"
        />
        <SidebarItem
          href="/profile"
          icon={
            <PersonOutline
              color={getIconColor("/profile")}
              width="20px"
              height="20px"
            />
          }
          label="プロフィール"
        />
      </nav>

      <div className="p-4">
        <Button
          className="w-full bg-[#D6B575] font-medium text-black"
          onPress={openDiaryModal}
          startContent={
            <CreateOutline color="#000000" width="20px" height="20px" />
          }
          endContent={
            <kbd className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-black/60 text-xs">
              N
            </kbd>
          }
        >
          日記を書く
        </Button>
      </div>
    </aside>
  );
};
