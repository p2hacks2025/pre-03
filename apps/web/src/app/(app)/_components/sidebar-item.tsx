"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

interface SidebarItemProps {
  href: string;
  icon: ReactNode;
  label: string;
}

export const SidebarItem = ({ href, icon, label }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-all ${
        isActive
          ? "bg-[#D6B575]/20 text-[#a07a2e]"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-500"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};
