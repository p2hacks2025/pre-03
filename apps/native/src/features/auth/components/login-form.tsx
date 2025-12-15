import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginInput, LoginInputSchema } from "@packages/schema/auth";
import { Button, Spinner, TextField, useToast } from "heroui-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";
import { useAuth } from "@/contexts/auth-context";

const StyledView = withUniwind(View);
const StyledIonicons = withUniwind(Ionicons);

interface LoginFormProps {
  onSignupPress?: () => void;
}

export const LoginForm = ({ onSignupPress }: LoginFormProps) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.show({
        variant: "success",
        label: "ログイン成功",
        description: "ようこそ！",
      });
    } catch (error) {
      toast.show({
        variant: "danger",
        label: "ログイン失敗",
        description:
          error instanceof Error
            ? error.message
            : "メールアドレスまたはパスワードが正しくありません",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledView className="gap-6">
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
              placeholder="********"
              secureTextEntry={!isPasswordVisible}
              autoComplete="password"
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
            {errors.password && (
              <TextField.ErrorMessage>
                {errors.password.message}
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
            <Button.Label>ログイン</Button.Label>
          )}
        </Button>

        {onSignupPress && (
          <Button variant="ghost" onPress={onSignupPress}>
            <Button.Label>アカウントをお持ちでない方はこちら</Button.Label>
          </Button>
        )}
      </StyledView>
    </StyledView>
  );
};
