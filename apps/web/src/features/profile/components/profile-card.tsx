"use client";

import { CheckmarkOutline, PencilOutline } from "react-ionicons";
import { Input, Spinner } from "@heroui/react";

import { useAuth } from "@/contexts/auth-context";

import { useProfileEdit } from "../hooks/use-profile-edit";
import { PROFILE_COLORS } from "../lib/colors";
import { ProfileAvatarDisplay } from "./profile-avatar-display";
import { ProfileStatsRow } from "./profile-stats-row";
import { ShareWorldButton } from "./share-world-button";

/** カードの固定幅 */
const CARD_WIDTH = 320;

/** 下線の固定幅 */
const UNDERLINE_WIDTH = 280;

/** 表示名エリアの固定高さ */
const NAME_AREA_HEIGHT = 36;

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
    editName,
    startEdit,
    cancelEdit,
    setEditName,
    saveEdit,
    inputRef,
  } = useProfileEdit();

  if (!profile) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <div
      className="rounded-3xl p-6"
      style={{
        width: CARD_WIDTH,
        backgroundColor: PROFILE_COLORS.card,
        boxShadow: `0 4px 20px ${PROFILE_COLORS.shadow}30`,
      }}
    >
      {/* アバター */}
      <ProfileAvatarDisplay />

      {/* ユーザーネーム + 編集 */}
      <div className="mt-4 flex flex-col items-center">
        {/* 固定高さのコンテナ（編集時も高さが変わらない） */}
        <div
          className="flex items-center justify-center"
          style={{ height: NAME_AREA_HEIGHT }}
        >
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={cancelEdit}
              isDisabled={isSaving}
              size="sm"
              classNames={{
                input: "text-xl font-bold text-center",
                inputWrapper: "bg-gray-100 border-primary",
              }}
              autoFocus
            />
          ) : (
            <span
              className="font-bold text-xl"
              style={{ color: PROFILE_COLORS.textPrimary }}
            >
              {profile.displayName}
            </span>
          )}
        </div>

        {/* 下線 + ボタン コンテナ */}
        <div className="relative mt-1" style={{ width: UNDERLINE_WIDTH }}>
          {/* 下線 */}
          <div
            className="w-full"
            style={{
              height: 2,
              backgroundColor: PROFILE_COLORS.gold,
            }}
          />

          {/* ボタン（下線の右端に配置、編集/確定をトグル） */}
          <button
            type="button"
            className="absolute top-[-32px] right-0.5 p-1 transition-opacity hover:opacity-70 disabled:opacity-50"
            onClick={isEditing ? saveEdit : startEdit}
            disabled={isSaving}
          >
            {isSaving ? (
              <Spinner size="sm" />
            ) : isEditing ? (
              <CheckmarkOutline color="#22c55e" width="20px" height="20px" />
            ) : (
              <PencilOutline color="#888888" width="20px" height="20px" />
            )}
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      <ProfileStatsRow />

      {/* シェアボタン */}
      <ShareWorldButton />
    </div>
  );
};
