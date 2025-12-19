import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Spinner, useToast } from "heroui-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";
import { EntryList, ProfileHeader } from "@/features/profile";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
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

  return (
    <StyledScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 16,
      }}
    >
      {/* ヘッダーエリア */}
      <StyledView style={{ paddingTop: insets.top + 8 }}>
        {/* アイコンバー */}
        <StyledView className="flex-row items-center justify-between px-4 py-2">
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
          <StyledText className="text-center font-bold text-foreground text-xl">
            プロフィール
          </StyledText>
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
        </StyledView>

        {/* プロフィール情報（ゴールド背景） */}
        <StyledView style={{ backgroundColor: COLORS.headerBackground }}>
          <ProfileHeader />
        </StyledView>
      </StyledView>

      {/* エントリー一覧 */}
      <EntryList />
    </StyledScrollView>
  );
};
