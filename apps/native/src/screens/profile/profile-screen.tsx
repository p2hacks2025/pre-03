import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Spinner, useToast } from "heroui-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";
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
  const { logout } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.show({
        variant: "success",
        label: "ログアウト完了",
        description: "またのご利用をお待ちしています",
      });
    } catch (error) {
      toast.show({
        variant: "danger",
        label: "ログアウト失敗",
        description:
          error instanceof Error ? error.message : "ログアウトに失敗しました",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

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

      <StyledView className="mt-8 px-4">
        <Button
          variant="danger"
          onPress={handleLogout}
          isDisabled={isLoggingOut}
          className="w-full"
        >
          {isLoggingOut ? (
            <Spinner size="sm" color="white" />
          ) : (
            <>
              <StyledIonicons
                name="log-out-outline"
                size={18}
                className="text-danger-foreground"
              />
              <Button.Label>ログアウト</Button.Label>
            </>
          )}
        </Button>
      </StyledView>
    </StyledScrollView>
  );
};
