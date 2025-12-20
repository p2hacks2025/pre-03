import { Ionicons } from "@expo/vector-icons";
import { Spinner } from "heroui-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";

import { useProfileEdit } from "../hooks";
import { ProfileAvatarDisplay } from "./profile-avatar-display";
import { ProfileStatsRow } from "./profile-stats-row";
import { ShareWorldButton } from "./share-world-button";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);
const StyledTextInput = withUniwind(TextInput);

// カラー定義
const COLORS = {
  goldUnderline: "#C4A86C",
  cardBackground: "#FFFFFF",
};

/**
 * プロフィールカード
 *
 * - プロフィール写真（ピンク縁取り）
 * - ユーザーネーム（インライン編集可能）
 * - 統計情報（連続投稿 | 投稿総数 | 世界数）
 * - シェアボタン
 */
export const ProfileCard = () => {
  const { profile } = useAuth();
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

  return (
    <StyledView
      className="mx-4 rounded-3xl p-6"
      style={{
        backgroundColor: COLORS.cardBackground,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {/* アバター */}
      <ProfileAvatarDisplay />

      {/* ユーザーネーム + 編集 */}
      <StyledView className="mt-4 items-center">
        <StyledView
          className="flex-row items-center"
          style={{
            borderBottomWidth: 2,
            borderBottomColor: COLORS.goldUnderline,
            paddingBottom: 4,
          }}
        >
          {isEditing ? (
            <StyledTextInput
              ref={inputRef}
              className="rounded-md border border-primary bg-background px-2 py-1 text-center text-foreground text-xl"
              value={editName}
              onChangeText={setEditName}
              onBlur={cancelEdit}
              onSubmitEditing={saveEdit}
              returnKeyType="done"
              autoFocus
              editable={!isSaving}
              style={{ minWidth: 150 }}
            />
          ) : (
            <StyledText className="px-2 font-bold text-foreground text-xl">
              {profile.displayName}
            </StyledText>
          )}

          <StyledPressable
            className="ml-2 rounded-md p-1 active:opacity-70"
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
      </StyledView>

      {/* 統計情報 */}
      <ProfileStatsRow />

      {/* シェアボタン */}
      <ShareWorldButton />
    </StyledView>
  );
};
