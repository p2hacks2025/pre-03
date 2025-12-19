import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Spinner, useToast } from "heroui-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { HEADER_HEIGHT, Header } from "@/components";
import { useAuth } from "@/contexts/auth-context";
import { EntryList, ProfileHeader } from "@/features/profile";

const StyledView = withUniwind(View);
const StyledScrollView = withUniwind(ScrollView);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);

// カラー定義
const COLORS = {
  headerBackground: "#C4A86C",
};

export const ProfileScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const executeLogout = async () => {
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

  const handleLogout = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      {
        text: "キャンセル",
        style: "cancel",
      },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: executeLogout,
      },
    ]);
  };

  const leftContent = (
    <StyledPressable
      className="rounded-full p-2 active:opacity-70"
      onPress={() => router.push("/(app)/health")}
    >
      <StyledIonicons
        name="pulse-outline"
        size={24}
        className="text-foreground"
      />
    </StyledPressable>
  );

  const rightContent = (
    <StyledPressable
      className="rounded-full p-2 active:opacity-70"
      onPress={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <Spinner size="sm" />
      ) : (
        <StyledIonicons
          name="log-out-outline"
          size={24}
          className="text-red-600"
        />
      )}
    </StyledPressable>
  );

  return (
    <StyledView className="flex-1 bg-background">
      <Header
        title="プロフィール"
        leftContent={leftContent}
        rightContent={rightContent}
      />

      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + HEADER_HEIGHT,
          paddingBottom: insets.bottom + 16,
        }}
      >
        {/* プロフィール情報（ゴールド背景） */}
        <StyledView style={{ backgroundColor: COLORS.headerBackground }}>
          <ProfileHeader />
        </StyledView>

        {/* エントリー一覧 */}
        <EntryList />
      </StyledScrollView>
    </StyledView>
  );
};
