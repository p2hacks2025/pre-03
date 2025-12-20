"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import Link from "next/link";

import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="flex flex-col items-center gap-2">
          <h2 className="font-semibold text-2xl">ログイン</h2>
          <p className="text-default-500 text-small">アカウントにログイン</p>
        </CardHeader>
        <CardBody>
          <LoginForm />
        </CardBody>
        <CardFooter className="justify-center">
          <p className="text-default-500 text-sm">
            アカウントをお持ちでない方は{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              新規登録
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
