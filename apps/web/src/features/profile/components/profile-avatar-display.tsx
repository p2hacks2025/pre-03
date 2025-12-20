"use client";

import { useRef, useState } from "react";
import { CameraOutline } from "react-ionicons";
import { Avatar, Spinner } from "@heroui/react";

import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

import { useProfileAvatar } from "../hooks/use-profile-avatar";

/**
 * プロフィールアバター表示
 *
 * - 100px のアバター
 * - ホバーでカメラアイコン表示
 * - クリックで画像選択・アップロード
 */
export const ProfileAvatarDisplay = () => {
  const { profile } = useAuth();
  const { isUploading, uploadAvatar } = useProfileAvatar();

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

  return (
    <div className="flex justify-center">
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
        className="relative cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed"
      >
        <Avatar
          src={profile.avatarUrl ?? undefined}
          name={displayNameInitials}
          showFallback
          className="h-[100px] w-[100px] text-xl"
        />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white transition-opacity",
            isUploading || isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          {isUploading ? (
            <Spinner size="sm" color="white" />
          ) : (
            <CameraOutline color="#ffffff" width="28px" height="28px" />
          )}
        </div>
      </button>
    </div>
  );
};
