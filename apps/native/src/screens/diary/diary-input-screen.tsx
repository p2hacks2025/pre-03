import { Ionicons } from "@expo/vector-icons";
import type { CreateEntryOutput } from "@packages/schema/entry";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Button, Spinner, useToast } from "heroui-native";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { useAuth } from "@/contexts/auth-context";
import { createAuthenticatedClient } from "@/lib/api";
import { postMultipartWithAuth } from "@/lib/multipart";

const StyledView = withUniwind(View);
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
        // 画像は handlePickImage で JPEG に統一済み
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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1, // manipulateAsync で圧縮するため、ここでは圧縮しない
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      // 常に JPEG に変換（HEIC 対策 + 統一フォーマット）
      const manipulated = await manipulateAsync(asset.uri, [], {
        compress: 0.8,
        format: SaveFormat.JPEG,
      });

      setSelectedImage({
        uri: manipulated.uri,
        width: asset.width,
        height: asset.height,
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
        {/* ヘッダー */}
        <StyledView className="flex-row items-center justify-between border-divider/50 border-b px-4 py-3">
          <Pressable onPress={handleClose} disabled={isSubmitting}>
            <StyledIonicons
              name="close"
              size={28}
              className={isSubmitting ? "text-muted" : "text-foreground"}
            />
          </Pressable>

          <Button
            size="sm"
            variant="primary"
            isDisabled={!canPost}
            onPress={handlePost}
          >
            {isSubmitting ? (
              <Spinner size="sm" color="white" />
            ) : (
              <Button.Label>投稿</Button.Label>
            )}
          </Button>
        </StyledView>

        {/* テキスト入力エリア */}
        <StyledView className="flex-1 px-4 pt-4">
          <StyledTextInput
            className="flex-1 text-foreground text-lg"
            placeholder="今日は何を食べましたか？"
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

        {/* ツールバー */}
        <StyledView className="flex-row items-center border-divider/50 border-t px-4 py-3">
          <StyledPressable
            className="items-center justify-center rounded-full p-2 active:bg-accent/10"
            onPress={handlePickImage}
            disabled={selectedImage !== null || isSubmitting}
          >
            <StyledIonicons
              name="image-outline"
              size={24}
              className={
                selectedImage || isSubmitting ? "text-muted" : "text-accent"
              }
            />
          </StyledPressable>
        </StyledView>
      </StyledView>
    </StyledKeyboardAvoidingView>
  );
};
