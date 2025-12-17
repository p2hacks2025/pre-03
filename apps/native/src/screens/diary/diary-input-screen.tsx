import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
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

  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );

  const handleClose = () => {
    router.back();
  };

  const handlePost = () => {
    console.log("投稿内容:", {
      content,
      image: selectedImage,
    });
    router.back();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const canPost = content.trim().length > 0;

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
          <Pressable onPress={handleClose}>
            <StyledIonicons
              name="close"
              size={28}
              className="text-foreground"
            />
          </Pressable>

          <Button
            size="sm"
            variant="primary"
            isDisabled={!canPost}
            onPress={handlePost}
          >
            <Button.Label>投稿</Button.Label>
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
            disabled={selectedImage !== null}
          >
            <StyledIonicons
              name="image-outline"
              size={24}
              className={selectedImage ? "text-muted" : "text-accent"}
            />
          </StyledPressable>
        </StyledView>
      </StyledView>
    </StyledKeyboardAvoidingView>
  );
};
