"use client";

import { useState } from "react";
import { postMultipart } from "@packages/api-contract";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { client } from "@/lib/api";

import { AvatarUpload } from "./avatar-upload";

import type { UploadAvatarOutput } from "@packages/schema/user";

export const UserInfo = () => {
  const { user, profile, logout, updateProfile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await postMultipart<UploadAvatarOutput>(
        client.user.avatar,
        formData,
      );
      updateProfile({ avatarUrl: result.avatarUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <AvatarUpload
              currentAvatarUrl={profile?.avatarUrl ?? null}
              displayName={profile?.displayName ?? null}
              isUploading={isUploading}
              onFileSelect={handleFileSelect}
            />
          </div>
          {error && (
            <p className="text-center text-destructive text-sm">{error}</p>
          )}
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email:</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">User ID:</dt>
              <dd className="font-mono text-sm">{user.id}</dd>
            </div>
            {profile && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Display Name:</dt>
                <dd className="font-medium">
                  {profile.displayName ?? "Not set"}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
};
