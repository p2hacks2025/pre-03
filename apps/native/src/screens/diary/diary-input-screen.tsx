import { Ionicons } from "@expo/vector-icons";
import type { CreateEntryOutput } from "@packages/schema/entry";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Button, Spinner, useToast } from "heroui-native";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { useAuth } from "@/contexts/auth-context";
import { PhotoGrid } from "@/features/diary";
import { createAuthenticatedClient } from "@/lib/api";
import { postMultipartWithAuth } from "@/lib/multipart";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledTextInput = withUniwind(TextInput);
const StyledImage = withUniwind(Image);
const StyledPressable = withUniwind(Pressable);
const StyledKeyboardAvoidingView = withUniwind(KeyboardAvoidingView);
const StyledIonicons = withUniwind(Ionicons);

interface SelectedImage {
  uri: string;
  width: number;
  height: number;
}

export const DiaryInputScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    router.back();
  };

  const handlePost = async () => {
    if (!accessToken) {
      toast.show({
        variant: "danger",
        label: "認証エラー",
        description: "ログインしてください",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim());

      if (selectedImage) {
        // React Native 特有の FormData 形式
        // 画像は processAndSetImage で JPEG に統一済み
        formData.append("file", {
          uri: selectedImage.uri,
          type: "image/jpeg",
          name: `image_${Date.now()}.jpg`,
        } as unknown as Blob);
      }

      const authClient = createAuthenticatedClient(accessToken);
      await postMultipartWithAuth<CreateEntryOutput>(
        authClient.entries,
        formData,
        accessToken,
      );

      toast.show({
        variant: "success",
        label: "投稿しました",
      });
      router.back();
    } catch (error) {
      toast.show({
        variant: "danger",
        label: "投稿に失敗しました",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const processAndSetImage = async (
    uri: string,
    width: number,
    height: number,
  ) => {
    // 常に JPEG に変換（HEIC 対策 + 統一フォーマット）
    const context = ImageManipulator.manipulate(uri);
    const renderedImage = await context.renderAsync();
    const manipulated = await renderedImage.saveAsync({
      compress: 0.8,
      format: SaveFormat.JPEG,
    });

    setSelectedImage({
      uri: manipulated.uri,
      width,
      height,
    });
  };

  const handleLaunchCamera = async () => {
    try {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!cameraPermission.granted) {
        toast.show({
          variant: "warning",
          label: "カメラへのアクセスが必要です",
          description: "設定からカメラへのアクセスを許可してください",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await processAndSetImage(asset.uri, asset.width, asset.height);
      }
    } catch (error) {
      toast.show({
        variant: "danger",
        label: "カメラの起動に失敗しました",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const handleSelectRecentPhoto = async (
    uri: string,
    width: number,
    height: number,
  ) => {
    try {
      await processAndSetImage(uri, width, height);
    } catch (error) {
      toast.show({
        variant: "danger",
        label: "画像の読み込みに失敗しました",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const canPost = content.trim().length > 0 && !isSubmitting;

  return (
    <StyledKeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={24}
    >
      <StyledView
        className="flex-1"
        style={{ paddingTop: 5, paddingBottom: insets.bottom }}
      >
        {/* タイトル */}
        <StyledView className="px-4 pt-2">
          <StyledText className="font-bold text-2xl text-foreground">
            日記の入力
          </StyledText>
        </StyledView>

        {/* ヘッダー */}
        <StyledView className="flex-row items-center justify-between px-4 py-3">
          <Pressable onPress={handleClose} disabled={isSubmitting}>
            <StyledIonicons
              name="close"
              size={28}
              className={isSubmitting ? "text-muted" : "text-foreground"}
            />
          </Pressable>

          <Button
            size="sm"
            className="bg-amber-600"
            isDisabled={!canPost}
            onPress={handlePost}
          >
            {isSubmitting ? (
              <Spinner size="sm" color="white" />
            ) : (
              <Button.Label>書き記す</Button.Label>
            )}
          </Button>
        </StyledView>

        {/* テキスト入力エリア */}
        <StyledView className="flex-1 px-4 pt-4">
          <StyledTextInput
            className="flex-1 text-foreground text-lg"
            placeholder="出来事を世界に刻みましょう"
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            autoFocus
            editable={!isSubmitting}
          />
        </StyledView>

        {/* 画像プレビュー */}
        {selectedImage && (
          <StyledView className="px-4 pb-4">
            <StyledView className="relative overflow-hidden rounded-xl">
              <StyledImage
                source={{ uri: selectedImage.uri }}
                className="h-48 w-full"
                resizeMode="cover"
              />
              <StyledPressable
                className="absolute top-2 right-2 items-center justify-center rounded-full bg-black/60 p-1.5"
                onPress={handleRemoveImage}
                disabled={isSubmitting}
              >
                <StyledIonicons name="close" size={18} className="text-white" />
              </StyledPressable>
            </StyledView>
          </StyledView>
        )}

        {/* 写真グリッド */}
        <StyledView className="border-divider/50 border-t py-3">
          <PhotoGrid
            onCameraPress={handleLaunchCamera}
            onPhotoSelect={handleSelectRecentPhoto}
            isDisabled={selectedImage !== null || isSubmitting}
          />
        </StyledView>
      </StyledView>
    </StyledKeyboardAvoidingView>
  );
};
