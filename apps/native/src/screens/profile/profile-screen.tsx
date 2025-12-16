import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { ProfileCard } from "@/features/auth";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledScrollView = withUniwind(ScrollView);
const StyledIonicons = withUniwind(Ionicons);

export const ProfileScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <StyledScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
      }}
    >
      <StyledView className="mb-6 items-center">
        <StyledText className="font-bold text-2xl text-foreground">
          プロフィール
        </StyledText>
      </StyledView>

      <ProfileCard />

      <StyledView className="mt-6 gap-3">
        <Button
          variant="secondary"
          onPress={() => router.push("/(app)/health")}
        >
          <StyledIonicons
            name="pulse-outline"
            size={18}
            className="text-accent-soft-foreground"
          />
          <Button.Label>システム状態</Button.Label>
        </Button>
      </StyledView>
    </StyledScrollView>
  );
};
