"use client";

import { useEffect } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // ログイン済みの場合は /dashboard にリダイレクト
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-default-500">Loading...</p>
      </div>
    );
  }

  // ログイン済みの場合はリダイレクト中
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-default-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <Card className="p-2">
          <CardHeader className="flex flex-col items-center gap-2">
            <h2 className="font-semibold text-xl">Welcome</h2>
            <p className="text-default-500 text-small">
              Get started by logging in or creating an account
            </p>
          </CardHeader>
          <CardBody className="space-y-3">
            <Button as={Link} href="/auth/login" color="primary" fullWidth>
              Login
            </Button>
            <Button as={Link} href="/auth/signup" variant="bordered" fullWidth>
              Sign Up
            </Button>
          </CardBody>
        </Card>
        <p className="text-center">
          <Link
            href="/health"
            className="text-default-500 text-sm hover:underline"
          >
            View Backend Status
          </Link>
        </p>
      </div>
    </div>
  );
}
