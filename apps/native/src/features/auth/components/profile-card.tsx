import { Ionicons } from "@expo/vector-icons";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Spinner,
  useToast,
} from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledIonicons = withUniwind(Ionicons);

export const ProfileCard = () => {
  const { user, profile, logout } = useAuth();
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

  const displayNameInitials = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  return (
    <Card>
      <Card.Body className="items-center gap-4">
        <Avatar size="lg" alt={profile?.displayName ?? "User"}>
          {profile?.avatarUrl ? (
            <Avatar.Image source={{ uri: profile.avatarUrl }} />
          ) : null}
          <Avatar.Fallback>{displayNameInitials}</Avatar.Fallback>
        </Avatar>

        <StyledView className="items-center gap-1">
          <Card.Title className="text-xl">
            {profile?.displayName ?? "名前未設定"}
          </Card.Title>
          <Card.Description>{user?.email}</Card.Description>
        </StyledView>
      </Card.Body>

      <Divider className="my-2" />

      <Card.Body className="gap-3">
        <StyledView className="flex-row items-center gap-3">
          <StyledView className="size-10 items-center justify-center rounded-full bg-accent/10">
            <StyledIonicons name="mail" size={18} className="text-accent" />
          </StyledView>
          <StyledView className="flex-1">
            <StyledText className="text-muted text-xs">
              メールアドレス
            </StyledText>
            <StyledText className="text-foreground">
              {user?.email ?? "-"}
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledView className="flex-row items-center gap-3">
          <StyledView className="size-10 items-center justify-center rounded-full bg-success/10">
            <StyledIonicons
              name="calendar"
              size={18}
              className="text-success"
            />
          </StyledView>
          <StyledView className="flex-1">
            <StyledText className="text-muted text-xs">登録日</StyledText>
            <StyledText className="text-foreground">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("ja-JP")
                : "-"}
            </StyledText>
          </StyledView>
        </StyledView>
      </Card.Body>

      <Divider className="my-2" />

      <Card.Footer>
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
      </Card.Footer>
    </Card>
  );
};
