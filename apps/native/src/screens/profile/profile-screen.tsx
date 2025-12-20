import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Spinner, useToast } from "heroui-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { HEADER_HEIGHT, Header } from "@/components";
import { useAuth } from "@/contexts/auth-context";
import {
  BackgroundCircle,
  ProfileCard,
  WeeklyWorldPreview,
} from "@/features/profile";

const StyledView = withUniwind(View);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);

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
    <StyledView className="flex-1 bg-white">
      {/* 背景の円（最背面） */}
      <BackgroundCircle />

      {/* Header（最前面） */}
      <Header
        title="プロフィール"
        leftContent={leftContent}
        rightContent={rightContent}
      />

      {/* メインコンテンツ */}
      <StyledView
        className="flex-1"
        style={{ paddingTop: insets.top + HEADER_HEIGHT }}
      >
        {/* プロフィールカード */}
        <StyledView className="items-center pt-4" style={{ zIndex: 1 }}>
          <ProfileCard />
        </StyledView>

        {/* 今週の世界 */}
        <StyledView
          className="items-center"
          style={{ marginTop: -30, zIndex: 2 }}
        >
          <WeeklyWorldPreview />
        </StyledView>
      </StyledView>
    </StyledView>
  );
};
