"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import Link from "next/link";

import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-2">
          <h2 className="font-semibold text-2xl">Login</h2>
          <p className="text-default-500 text-small">Sign in to your account</p>
        </CardHeader>
        <CardBody>
          <LoginForm />
        </CardBody>
        <CardFooter className="justify-center">
          <p className="text-default-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
