import { Ionicons } from "@expo/vector-icons";
import { Avatar, Spinner } from "heroui-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";

import { useProfileAvatar, useProfileEdit, useProfileStats } from "../hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);
const StyledTextInput = withUniwind(TextInput);

export const ProfileHeader = () => {
  const { profile } = useAuth();
  const { streakDays } = useProfileStats();
  const { isUploading, pickImage } = useProfileAvatar();
  const {
    isEditing,
    isSaving,
    editName,
    startEdit,
    cancelEdit,
    setEditName,
    saveEdit,
    inputRef,
  } = useProfileEdit();

  if (!profile) return null;

  const displayNameInitials = profile.displayName.slice(0, 2);

  return (
    <StyledView className="flex-row items-center gap-4 px-4 py-4">
      <StyledPressable
        className="relative active:opacity-70"
        onPress={pickImage}
        disabled={isUploading}
      >
        <Avatar size="lg" alt={profile.displayName}>
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
        {/* カメラアイコンオーバーレイ */}
        <StyledView className="absolute right-0 bottom-0 items-center justify-center rounded-full bg-primary p-1">
          <StyledIonicons name="camera" size={14} className="text-white" />
        </StyledView>
      </StyledPressable>

      <StyledView className="flex-1">
        <StyledView
          className="flex-row items-center"
          style={{ borderBottomWidth: 1, borderBottomColor: "#fff" }}
        >
          {isEditing ? (
            <StyledTextInput
              ref={inputRef}
              className="flex-1 rounded-md border border-primary bg-background p-1 text-2xl text-foreground"
              value={editName}
              onChangeText={setEditName}
              onBlur={cancelEdit}
              onSubmitEditing={saveEdit}
              returnKeyType="done"
              autoFocus
              editable={!isSaving}
            />
          ) : (
            <StyledText className="flex-1 rounded-md border border-transparent p-1 font-bold text-2xl text-foreground">
              {profile.displayName}
            </StyledText>
          )}
          <StyledPressable
            className={`mt-1 ml-2 rounded-md px-1 py-1 active:opacity-70 ${
              isEditing ? "bg-success" : "bg-muted/30"
            }`}
            onPress={isEditing ? saveEdit : startEdit}
            disabled={isSaving}
          >
            {isSaving ? (
              <Spinner size="sm" />
            ) : (
              <StyledIonicons
                name={isEditing ? "checkmark" : "pencil-outline"}
                size={18}
                className={isEditing ? "text-black" : "text-muted"}
              />
            )}
          </StyledPressable>
        </StyledView>

        <StyledText className="mt-2 px-2 text-foreground">
          {streakDays}日連続!
        </StyledText>
      </StyledView>
    </StyledView>
  );
};
