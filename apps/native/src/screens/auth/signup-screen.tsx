import { useRouter } from "expo-router";
import { Card } from "heroui-native";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { SignupForm } from "@/features/auth";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledScrollView = withUniwind(ScrollView);
const StyledKeyboardAvoidingView = withUniwind(KeyboardAvoidingView);

export const SignupScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLoginPress = () => {
    router.push("/(auth)/login");
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
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <StyledView className="flex-1 justify-center">
          <StyledView className="mb-8 items-center">
            <StyledText className="font-bold text-3xl text-foreground">
              新規登録
            </StyledText>
          </StyledView>

          <Card>
            <Card.Body>
              <SignupForm onLoginPress={handleLoginPress} />
            </Card.Body>
          </Card>
        </StyledView>
      </StyledScrollView>
    </StyledKeyboardAvoidingView>
  );
};
