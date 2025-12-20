"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import Link from "next/link";

import { SignupForm } from "./_components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="flex flex-col items-center gap-2">
          <h2 className="font-semibold text-2xl">新規登録</h2>
          <p className="text-default-500 text-small">新しいアカウントを作成</p>
        </CardHeader>
        <CardBody>
          <SignupForm />
        </CardBody>
        <CardFooter className="justify-center">
          <p className="text-default-500 text-sm">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
