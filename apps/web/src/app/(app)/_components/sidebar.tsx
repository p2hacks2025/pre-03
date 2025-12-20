"use client";

import {
  CalendarOutline,
  CreateOutline,
  HomeOutline,
  PersonOutline,
} from "react-ionicons";
import { Button } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";

export const Sidebar = () => {
  const pathname = usePathname();

  // アクティブ状態に応じたアイコン色
  const getIconColor = (href: string) =>
    pathname === href ? "#D6B575" : "#9CA3AF";

  return (
    <aside className="flex h-screen w-60 flex-col border-gray-200 border-r bg-white">
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
          label="カレンダー"
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
          as={Link}
          href="/diary/new"
          className="w-full bg-[#D6B575] font-medium text-black"
          startContent={
            <CreateOutline color="#000000" width="20px" height="20px" />
          }
        >
          日記を書く
        </Button>
      </div>
    </aside>
  );
};
