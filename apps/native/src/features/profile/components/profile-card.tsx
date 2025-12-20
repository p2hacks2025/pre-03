import { Ionicons } from "@expo/vector-icons";
import { Spinner } from "heroui-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { withUniwind } from "uniwind";

import { useAuth } from "@/contexts/auth-context";
import { FONT_FAMILY } from "@/lib/fonts";

import { useProfileEdit } from "../hooks";
import { PROFILE_COLORS } from "../lib/colors";
import { ProfileAvatarDisplay } from "./profile-avatar-display";
import { ProfileStatsRow } from "./profile-stats-row";
import { ShareWorldButton } from "./share-world-button";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);
const StyledTextInput = withUniwind(TextInput);

// カードの固定幅（iPhone SE3: 375pt でも左右約27ptの余白確保）
const CARD_WIDTH = 320;

// 下線の固定幅
const UNDERLINE_WIDTH = 280;

// 表示名エリアの固定高さ（編集時も高さが変わらないように）
const NAME_AREA_HEIGHT = 36;

// テキスト入力フィールドの幅（下線幅 - ボタン分の余白）
const TEXT_INPUT_WIDTH = 230;

/**
 * プロフィールカード
 *
 * - プロフィール写真
 * - ユーザーネーム（インライン編集可能、中央揃え）
 * - 統計情報（連続投稿 | 投稿総数 | 世界数）
 * - シェアボタン
 */
export const ProfileCard = () => {
  const { profile } = useAuth();
  const {
    isEditing,
    isSaving,
    draftDisplayName,
    startEdit,
    cancelEdit,
    setDraftDisplayName,
    saveEdit,
    inputRef,
  } = useProfileEdit();

  if (!profile) return null;

  return (
    <StyledView
      className="rounded-3xl p-6"
      style={{
        width: CARD_WIDTH,
        backgroundColor: PROFILE_COLORS.card,
        shadowColor: PROFILE_COLORS.shadow,
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
        {/* 固定高さのコンテナ（編集時も高さが変わらない） */}
        <StyledView
          className="items-center justify-center"
          style={{ height: NAME_AREA_HEIGHT }}
        >
          {isEditing ? (
            /* 編集モード: TextField（中央揃え） */
            <StyledTextInput
              ref={inputRef}
              className="rounded-md border border-primary bg-background px-2 py-1 text-foreground text-xl"
              value={draftDisplayName}
              onChangeText={setDraftDisplayName}
              onBlur={cancelEdit}
              onSubmitEditing={saveEdit}
              returnKeyType="done"
              autoFocus
              editable={!isSaving}
              style={{ width: TEXT_INPUT_WIDTH }}
            />
          ) : (
            /* 表示モード: 表示名（完全中央揃え） */
            <StyledText
              className="font-bold text-foreground text-xl"
              style={{ fontFamily: FONT_FAMILY.MADOUFMG }}
            >
              {profile.displayName}
            </StyledText>
          )}
        </StyledView>

        {/* 下線 + ボタン コンテナ */}
        <StyledView
          style={{
            position: "relative",
            width: UNDERLINE_WIDTH,
            marginTop: 4,
          }}
        >
          {/* 下線 */}
          <StyledView
            style={{
              width: "100%",
              height: 2,
              backgroundColor: PROFILE_COLORS.gold,
            }}
          />

          {/* ボタン（下線の右端に配置、編集/確定をトグル） */}
          <StyledPressable
            style={{
              position: "absolute",
              right: 2,
              top: -32,
              padding: 4,
            }}
            className="active:opacity-70"
            onPress={isEditing ? saveEdit : startEdit}
            disabled={isSaving}
          >
            {isSaving ? (
              <Spinner size="sm" />
            ) : isEditing ? (
              <StyledIonicons
                name="checkmark"
                size={20}
                className="text-success"
              />
            ) : (
              <StyledIonicons
                name="pencil-outline"
                size={20}
                className="text-muted"
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
