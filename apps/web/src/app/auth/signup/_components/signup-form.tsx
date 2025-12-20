"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

import { type SignupFormValues, signupFormSchema } from "../_lib/validations";

export const SignupForm = () => {
  const router = useRouter();
  const { signup } = useAuth();
  const [error, setError] = useState("");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setError("");
    try {
      await signup(values.email, values.password, values.displayName);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="displayName"
        control={form.control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            label="表示名"
            placeholder="山田太郎"
            isInvalid={!!error}
            errorMessage={error?.message}
          />
        )}
      />

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            type="email"
            label="メールアドレス"
            placeholder="user@example.com"
            isInvalid={!!error}
            errorMessage={error?.message}
          />
        )}
      />

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            type="password"
            label="パスワード"
            placeholder="********"
            isInvalid={!!error}
            errorMessage={error?.message}
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            type="password"
            label="パスワード（確認）"
            placeholder="********"
            isInvalid={!!error}
            errorMessage={error?.message}
          />
        )}
      />

      {error && (
        <div className="rounded-md bg-danger-50 p-3 text-danger text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        color="primary"
        fullWidth
        isLoading={form.formState.isSubmitting}
      >
        新規登録
      </Button>
    </form>
  );
};
