import { Redirect, Stack } from "expo-router";
import { Spinner } from "heroui-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";

const StyledView = withUniwind(View);

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </StyledView>
    );
  }

  // 認証済みならホームへリダイレクト
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen
        name="health"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "システム状態",
        }}
      />
    </Stack>
  );
}
