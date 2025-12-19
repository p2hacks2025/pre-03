"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import Link from "next/link";

import { SignupForm } from "./_components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="flex flex-col items-center gap-2">
          <h2 className="font-semibold text-2xl">Sign Up</h2>
          <p className="text-default-500 text-small">Create a new account</p>
        </CardHeader>
        <CardBody>
          <SignupForm />
        </CardBody>
        <CardFooter className="justify-center">
          <p className="text-default-500 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
