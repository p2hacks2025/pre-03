"use client";

import { useRef, useState } from "react";
import { CameraOutline, CheckmarkOutline, PencilOutline } from "react-ionicons";
import { Avatar, Input, Spinner } from "@heroui/react";

import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

import { useProfileAvatar } from "../hooks/use-profile-avatar";
import { useProfileEdit } from "../hooks/use-profile-edit";
import { useProfileStats } from "../hooks/use-profile-stats";

export const ProfileHeader = () => {
  const { profile } = useAuth();
  const { streakDays } = useProfileStats();
  const { isUploading, uploadAvatar } = useProfileAvatar();
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  if (!profile) return null;

  const displayNameInitials = profile.displayName.slice(0, 2);

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar(file);
      e.target.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <div className="flex items-center gap-4 px-6 py-6">
      {/* アバター */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <button
          type="button"
          onClick={handleAvatarClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isUploading}
          className="relative cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#C4A86C] disabled:cursor-not-allowed"
        >
          <Avatar
            src={profile.avatarUrl ?? undefined}
            name={displayNameInitials}
            showFallback
            className="h-20 w-20 text-lg"
          />
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white text-xs transition-opacity",
              isUploading || isHovered ? "opacity-100" : "opacity-0",
            )}
          >
            {isUploading ? (
              <Spinner size="sm" color="white" />
            ) : (
              <CameraOutline color="#ffffff" width="24px" height="24px" />
            )}
          </div>
        </button>
      </div>

      {/* 名前と連続日数 */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={cancelEdit}
              isDisabled={isSaving}
              size="lg"
              classNames={{
                input: "text-xl font-bold",
                inputWrapper: "bg-white/20 border-white/30",
              }}
              autoFocus
            />
          ) : (
            <h2 className="font-bold text-2xl text-white">
              {profile.displayName}
            </h2>
          )}
          <button
            type="button"
            onClick={isEditing ? saveEdit : startEdit}
            disabled={isSaving}
            className={cn(
              "flex items-center justify-center rounded-md p-1.5 transition-colors",
              isEditing
                ? "bg-green-500 hover:bg-green-600"
                : "bg-white/20 hover:bg-white/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {isSaving ? (
              <Spinner size="sm" color="white" />
            ) : isEditing ? (
              <CheckmarkOutline color="#ffffff" width="18px" height="18px" />
            ) : (
              <PencilOutline color="#ffffff" width="18px" height="18px" />
            )}
          </button>
        </div>

        <p className="mt-2 text-white/90">{streakDays}日連続!</p>
      </div>
    </div>
  );
};
