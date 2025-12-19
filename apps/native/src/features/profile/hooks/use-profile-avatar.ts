import type { UploadAvatarOutput } from "@packages/schema/user";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "heroui-native";
import { useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { createAuthenticatedClient } from "@/lib/api";
import { postMultipartWithAuth } from "@/lib/multipart";

export interface UseProfileAvatarReturn {
  isUploading: boolean;
  pickImage: () => Promise<void>;
}

/**
 * プロフィールアバター画像のアップロードを管理するフック
 *
 * - フォトライブラリから画像を選択
 * - 正方形にクロップ（ネイティブUIを使用）
 * - JPEG形式に変換して圧縮
 * - APIにアップロード
 * - ローカル状態を更新
 */
export const useProfileAvatar = (): UseProfileAvatarReturn => {
  const { accessToken, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    if (!accessToken) {
      toast.show({
        variant: "danger",
        label: "認証エラー",
        description: "再度ログインしてください",
      });
      return;
    }

    try {
      // パーミッション確認
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        toast.show({
          variant: "warning",
          label: "フォトライブラリへのアクセスが必要です",
          description: "設定からアクセスを許可してください",
        });
        return;
      }

      // 画像選択（正方形クロップ付き）
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];

      setIsUploading(true);

      // JPEG に変換（HEIC対策 + 統一フォーマット）
      const context = ImageManipulator.manipulate(asset.uri);
      const renderedImage = await context.renderAsync();
      const manipulated = await renderedImage.saveAsync({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });

      // FormData を作成（React Native 形式）
      const formData = new FormData();
      formData.append("file", {
        uri: manipulated.uri,
        type: "image/jpeg",
        name: `avatar_${Date.now()}.jpg`,
      } as unknown as Blob);

      // API にアップロード
      const authClient = createAuthenticatedClient(accessToken);
      const response = await postMultipartWithAuth<UploadAvatarOutput>(
        authClient.user.avatar,
        formData,
        accessToken,
      );

      // ローカル状態を更新
      updateProfile({ avatarUrl: response.avatarUrl });

      toast.show({
        variant: "success",
        label: "プロフィール画像を更新しました",
      });
    } catch (error) {
      toast.show({
        variant: "danger",
        label: "画像のアップロードに失敗しました",
        description:
          error instanceof Error ? error.message : "もう一度お試しください",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    pickImage,
  };
};
