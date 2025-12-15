import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { Avatar, Button, Card, Surface } from "heroui-native";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledScrollView = withUniwind(ScrollView);
const StyledIonicons = withUniwind(Ionicons);
const StyledSurface = withUniwind(Surface);

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const displayNameInitials = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  return (
    <StyledScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 16,
      }}
    >
      {/* ヘッダー */}
      <StyledSurface
        className="px-4 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <StyledView className="flex-row items-center justify-between">
          <StyledView>
            <StyledText className="text-muted text-sm">ようこそ</StyledText>
            <StyledText className="font-bold text-2xl text-foreground">
              {profile?.displayName ?? "ゲスト"}さん
            </StyledText>
          </StyledView>
          <Button
            variant="ghost"
            isIconOnly
            onPress={() => router.push("/(app)/profile")}
          >
            <Avatar size="md" alt={profile?.displayName ?? "User"}>
              {profile?.avatarUrl ? (
                <Avatar.Image source={{ uri: profile.avatarUrl }} />
              ) : null}
              <Avatar.Fallback>{displayNameInitials}</Avatar.Fallback>
            </Avatar>
          </Button>
        </StyledView>
      </StyledSurface>

      <StyledView className="px-4 pt-4">
        <Card className="mb-6">
          <Card.Body>
            <Card.Title>ダッシュボード</Card.Title>
            <Card.Description>
              アプリケーションへようこそ。ここから各機能にアクセスできます。
            </Card.Description>
          </Card.Body>
        </Card>

        <StyledView className="gap-3">
          <Link href="/(app)/profile" asChild>
            <Button variant="secondary">
              <StyledIonicons
                name="person-outline"
                size={18}
                className="text-accent-soft-foreground"
              />
              <Button.Label>プロフィール</Button.Label>
            </Button>
          </Link>

          <Link href="/(app)/health" asChild>
            <Button variant="secondary">
              <StyledIonicons
                name="pulse-outline"
                size={18}
                className="text-accent-soft-foreground"
              />
              <Button.Label>システム状態</Button.Label>
            </Button>
          </Link>
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
}
