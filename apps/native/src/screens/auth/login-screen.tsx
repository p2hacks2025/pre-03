import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Card } from "heroui-native";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { LoginForm } from "@/features/auth";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledScrollView = withUniwind(ScrollView);
const StyledKeyboardAvoidingView = withUniwind(KeyboardAvoidingView);
const StyledIonicons = withUniwind(Ionicons);

export const LoginScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignupPress = () => {
    router.push("/(auth)/signup");
  };

  const handleHealthPress = () => {
    router.push("/(auth)/health");
  };

  return (
    <StyledKeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ヘッダー */}
        <StyledView className="mb-4 flex-row items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onPress={handleHealthPress}
          >
            <StyledIonicons
              name="pulse-outline"
              size={20}
              className="text-muted"
            />
          </Button>
        </StyledView>

        <StyledView className="flex-1 justify-center">
          <StyledView className="mb-8 items-center">
            <StyledText className="font-bold text-3xl text-foreground">
              ログイン
            </StyledText>
          </StyledView>

          <Card>
            <Card.Body>
              <LoginForm onSignupPress={handleSignupPress} />
            </Card.Body>
          </Card>
        </StyledView>
      </StyledScrollView>
    </StyledKeyboardAvoidingView>
  );
};
