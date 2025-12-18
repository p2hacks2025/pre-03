import { Ionicons } from "@expo/vector-icons";
import { Avatar, Spinner } from "heroui-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";

import { useProfileEdit, useProfileStats } from "../hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);
const StyledTextInput = withUniwind(TextInput);

export const ProfileHeader = () => {
  const { profile } = useAuth();
  const { streakDays } = useProfileStats();
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
      <Avatar size="lg" alt={profile.displayName}>
        {profile.avatarUrl ? (
          <Avatar.Image source={{ uri: profile.avatarUrl }} />
        ) : null}
        <Avatar.Fallback>{displayNameInitials}</Avatar.Fallback>
      </Avatar>

      <StyledView className="flex-1">
        <StyledView
          className="flex-row items-center pb-2"
          style={{ borderBottomWidth: 1, borderBottomColor: "#e5e5e5" }}
        >
          {isEditing ? (
            <StyledTextInput
              ref={inputRef}
              className="flex-1 rounded-md border border-primary bg-background px-2 py-1 text-foreground text-xl"
              value={editName}
              onChangeText={setEditName}
              onBlur={cancelEdit}
              onSubmitEditing={saveEdit}
              returnKeyType="done"
              autoFocus
              editable={!isSaving}
            />
          ) : (
            <StyledText className="flex-1 rounded-md border border-transparent px-2 py-1 font-bold text-foreground text-xl">
              {profile.displayName}
            </StyledText>
          )}
          <StyledPressable
            className={`ml-2 rounded-md px-3 py-1 active:opacity-70 ${
              isEditing ? "bg-success/20" : "bg-muted/20"
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
                className={isEditing ? "text-success" : "text-muted"}
              />
            )}
          </StyledPressable>
        </StyledView>

        <StyledText className="mt-2 text-muted">{streakDays}日連続!</StyledText>
      </StyledView>
    </StyledView>
  );
};
