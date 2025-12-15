import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner, TextField, useToast } from "heroui-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";
import {
  type SignupFormValues,
  signupFormSchema,
} from "@/features/auth/lib/validations";

const StyledView = withUniwind(View);
const StyledIonicons = withUniwind(Ionicons);

interface SignupFormProps {
  onLoginPress?: () => void;
}

export const SignupForm = ({ onLoginPress }: SignupFormProps) => {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      await signup(data.email, data.password, data.displayName);
      toast.show({
        variant: "success",
        label: "アカウント作成完了",
        description: "ようこそ！",
      });
    } catch (error) {
      toast.show({
        variant: "danger",
        label: "登録失敗",
        description:
          error instanceof Error
            ? error.message
            : "アカウントの作成に失敗しました",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledView className="gap-5">
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField isRequired isInvalid={!!errors.displayName}>
            <TextField.Label>表示名</TextField.Label>
            <TextField.Input
              placeholder="山田 太郎"
              autoCapitalize="words"
              autoComplete="name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            >
              <TextField.InputStartContent className="pointer-events-none">
                <StyledIonicons
                  name="person-outline"
                  size={16}
                  className="text-muted"
                />
              </TextField.InputStartContent>
            </TextField.Input>
            {errors.displayName && (
              <TextField.ErrorMessage>
                {errors.displayName.message}
              </TextField.ErrorMessage>
            )}
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField isRequired isInvalid={!!errors.email}>
            <TextField.Label>メールアドレス</TextField.Label>
            <TextField.Input
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            >
              <TextField.InputStartContent className="pointer-events-none">
                <StyledIonicons
                  name="mail-outline"
                  size={16}
                  className="text-muted"
                />
              </TextField.InputStartContent>
            </TextField.Input>
            {errors.email && (
              <TextField.ErrorMessage>
                {errors.email.message}
              </TextField.ErrorMessage>
            )}
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField isRequired isInvalid={!!errors.password}>
            <TextField.Label>パスワード</TextField.Label>
            <TextField.Input
              placeholder="8文字以上"
              secureTextEntry={!isPasswordVisible}
              autoComplete="new-password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            >
              <TextField.InputStartContent className="pointer-events-none">
                <StyledIonicons
                  name="lock-closed-outline"
                  size={16}
                  className="text-muted"
                />
              </TextField.InputStartContent>
              <TextField.InputEndContent>
                <Pressable
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <StyledIonicons
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={16}
                    className="text-muted"
                  />
                </Pressable>
              </TextField.InputEndContent>
            </TextField.Input>
            <TextField.Description>
              8文字以上で入力してください
            </TextField.Description>
            {errors.password && (
              <TextField.ErrorMessage>
                {errors.password.message}
              </TextField.ErrorMessage>
            )}
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField isRequired isInvalid={!!errors.confirmPassword}>
            <TextField.Label>パスワード（確認）</TextField.Label>
            <TextField.Input
              placeholder="もう一度入力"
              secureTextEntry={!isConfirmPasswordVisible}
              autoComplete="new-password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            >
              <TextField.InputStartContent className="pointer-events-none">
                <StyledIonicons
                  name="lock-closed-outline"
                  size={16}
                  className="text-muted"
                />
              </TextField.InputStartContent>
              <TextField.InputEndContent>
                <Pressable
                  onPress={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                >
                  <StyledIonicons
                    name={
                      isConfirmPasswordVisible
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={16}
                    className="text-muted"
                  />
                </Pressable>
              </TextField.InputEndContent>
            </TextField.Input>
            {errors.confirmPassword && (
              <TextField.ErrorMessage>
                {errors.confirmPassword.message}
              </TextField.ErrorMessage>
            )}
          </TextField>
        )}
      />

      <StyledView className="gap-3 pt-2">
        <Button
          onPress={handleSubmit(onSubmit)}
          isDisabled={isSubmitting}
          variant="primary"
        >
          {isSubmitting ? (
            <Spinner size="sm" color="white" />
          ) : (
            <Button.Label>アカウント作成</Button.Label>
          )}
        </Button>

        {onLoginPress && (
          <Button variant="ghost" onPress={onLoginPress}>
            <Button.Label>既にアカウントをお持ちの方はこちら</Button.Label>
          </Button>
        )}
      </StyledView>
    </StyledView>
  );
};
