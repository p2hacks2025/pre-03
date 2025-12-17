import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { formatDateToISO } from "@/features/calendar/lib/date-utils";
import { EntryList, ProfileHeader } from "@/features/profile";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledScrollView = withUniwind(ScrollView);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);

export const ProfileScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = new Date();

  return (
    <StyledScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <StyledView className="mb-4 flex-row items-center justify-between px-4">
        <StyledText className="text-foreground text-lg">
          {formatDateToISO(today)}
        </StyledText>
        <StyledPressable
          className="rounded-full p-2 active:opacity-70"
          onPress={() => router.push("/(app)/health")}
        >
          <StyledIonicons
            name="pulse-outline"
            size={24}
            className="text-muted"
          />
        </StyledPressable>
      </StyledView>

      <StyledView className="bg-muted/5 pb-4">
        <ProfileHeader />
      </StyledView>

      <EntryList />
    </StyledScrollView>
  );
};
