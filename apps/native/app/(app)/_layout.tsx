import { Redirect, Stack } from "expo-router";
import { Spinner } from "heroui-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";

const StyledView = withUniwind(View);

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </StyledView>
    );
  }

  // 未認証ならログイン画面へリダイレクト
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "ホーム" }}
      />
      <Stack.Screen
        name="profile"
        options={{ headerShown: false, title: "プロフィール" }}
      />
      <Stack.Screen
        name="health"
        options={{ headerShown: false, title: "システム状態" }}
      />
    </Stack>
  );
}
