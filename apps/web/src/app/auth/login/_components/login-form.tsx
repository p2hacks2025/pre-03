"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginInput, LoginInputSchema } from "@packages/schema/auth";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

export const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setError("");
    try {
      await login(values.email, values.password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            type="email"
            label="Email"
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
            label="Password"
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
        Login
      </Button>
    </form>
  );
};
