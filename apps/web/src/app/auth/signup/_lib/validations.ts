import { SignupInputSchema } from "@packages/schema/auth";
import { z } from "zod";

export const signupFormSchema = SignupInputSchema.extend({
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
