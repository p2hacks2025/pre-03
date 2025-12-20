import { Avatar, Spinner } from "heroui-native";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";

import { useProfileAvatar } from "../hooks";

const StyledView = withUniwind(View);
const StyledPressable = withUniwind(Pressable);

// カラー定義
const COLORS = {
  pinkBorder: "#FFB6C1",
};

// アバターサイズ
const AVATAR_SIZE = 100;
const BORDER_WIDTH = 3;

/**
 * ピンク縁取り付きプロフィールアバター
 *
 * - タップで画像を変更可能
 * - ピンク色の縁取り
 * - ローディング時はスピナー表示
 */
export const ProfileAvatarDisplay = () => {
  const { profile } = useAuth();
  const { isUploading, pickImage } = useProfileAvatar();

  if (!profile) return null;

  const displayNameInitials = profile.displayName.slice(0, 2);

  return (
    <StyledView className="items-center">
      <StyledPressable
        className="active:opacity-70"
        onPress={pickImage}
        disabled={isUploading}
      >
        <StyledView
          style={{
            width: AVATAR_SIZE + BORDER_WIDTH * 2,
            height: AVATAR_SIZE + BORDER_WIDTH * 2,
            borderRadius: (AVATAR_SIZE + BORDER_WIDTH * 2) / 2,
            borderWidth: BORDER_WIDTH,
            borderColor: COLORS.pinkBorder,
            padding: 0,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <Avatar
            size="lg"
            alt={profile.displayName}
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
            }}
          >
            {isUploading ? (
              <Avatar.Fallback>
                <Spinner size="sm" />
              </Avatar.Fallback>
            ) : (
              <>
                {profile.avatarUrl ? (
                  <Avatar.Image source={{ uri: profile.avatarUrl }} />
                ) : null}
                <Avatar.Fallback>{displayNameInitials}</Avatar.Fallback>
              </>
            )}
          </Avatar>
        </StyledView>
      </StyledPressable>
    </StyledView>
  );
};
