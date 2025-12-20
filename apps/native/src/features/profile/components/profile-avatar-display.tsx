import { Avatar, Spinner } from "heroui-native";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";

import { useProfileAvatar } from "../hooks";

const StyledView = withUniwind(View);
const StyledPressable = withUniwind(Pressable);

// アバターサイズ
const AVATAR_SIZE = 100;

/**
 * プロフィールアバター
 *
 * - タップで画像を変更可能
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
      </StyledPressable>
    </StyledView>
  );
};
