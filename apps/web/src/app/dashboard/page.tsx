"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

import { UserInfo } from "./_components/user-info";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // 未ログインの場合はホームページにリダイレクト
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // 未ログインの場合はリダイレクト中
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <UserInfo />
        <p className="text-center">
          <Link
            href="/health"
            className="text-muted-foreground text-sm hover:underline"
          >
            View Backend Status
          </Link>
        </p>
      </div>
    </div>
  );
}
