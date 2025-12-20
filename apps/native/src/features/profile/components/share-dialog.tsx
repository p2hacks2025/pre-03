import { Ionicons } from "@expo/vector-icons";
import { Spinner } from "heroui-native";
import { Image, Modal, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { withUniwind } from "uniwind";

import { FONT_FAMILY } from "@/lib/fonts";

import { PROFILE_COLORS } from "../lib/colors";
import { SHARE_IMAGE } from "../lib/share-constants";

const AnimatedView = withUniwind(Animated.View);
const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);
const StyledImage = withUniwind(Image);
const StyledIonicons = withUniwind(Ionicons);

export interface ShareDialogProps {
  /** ダイアログの表示状態 */
  visible: boolean;
  /** プレビュー画像のURI */
  previewUri: string | null;
  /** 画像生成中フラグ */
  isGenerating: boolean;
  /** シェア処理中フラグ */
  isSharing: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 閉じるボタン押下時のコールバック */
  onClose: () => void;
  /** シェアボタン押下時のコールバック */
  onShare: () => void;
}

/**
 * シェアプレビューダイアログ
 *
 * 生成された画像のプレビューとシェアアクションを提供。
 * React Native Modal を使用。
 */
export const ShareDialog = ({
  visible,
  previewUri,
  isGenerating,
  isSharing,
  error,
  onClose,
  onShare,
}: ShareDialogProps) => {
  // プレビュー画像のアスペクト比を計算
  const aspectRatio = SHARE_IMAGE.WIDTH / SHARE_IMAGE.HEIGHT;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <AnimatedView
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 items-center justify-center bg-black/60 px-4"
      >
        {/* ダイアログカード */}
        <StyledView
          className="w-full max-w-lg overflow-hidden rounded-2xl"
          style={{ backgroundColor: PROFILE_COLORS.card }}
        >
          {/* ヘッダー */}
          <StyledView
            className="flex-row items-center justify-between border-b px-4 py-3"
            style={{ borderBottomColor: PROFILE_COLORS.divider }}
          >
            <StyledText
              className="font-bold text-lg"
              style={{
                color: PROFILE_COLORS.textPrimary,
                fontFamily: FONT_FAMILY.MADOUFMG,
              }}
            >
              シェア画像プレビュー
            </StyledText>
            <StyledPressable
              className="rounded-full p-1 active:opacity-70"
              onPress={onClose}
              disabled={isSharing}
            >
              <StyledIonicons
                name="close"
                size={24}
                style={{ color: PROFILE_COLORS.textSecondary }}
              />
            </StyledPressable>
          </StyledView>

          {/* コンテンツ */}
          <StyledView className="items-center p-4">
            {isGenerating ? (
              // ローディング表示
              <StyledView
                className="items-center justify-center"
                style={{ aspectRatio, width: "100%" }}
              >
                <Spinner size="lg" />
                <StyledText
                  className="mt-3"
                  style={{ color: PROFILE_COLORS.textSecondary }}
                >
                  画像を生成中...
                </StyledText>
              </StyledView>
            ) : error ? (
              // エラー表示
              <StyledView
                className="items-center justify-center"
                style={{ aspectRatio, width: "100%" }}
              >
                <StyledIonicons
                  name="alert-circle-outline"
                  size={48}
                  style={{ color: "#EF4444" }}
                />
                <StyledText
                  className="mt-3 text-center"
                  style={{ color: "#EF4444" }}
                >
                  {error}
                </StyledText>
              </StyledView>
            ) : previewUri ? (
              // プレビュー画像表示
              <StyledImage
                source={{ uri: previewUri }}
                style={{
                  width: "100%",
                  aspectRatio,
                  borderRadius: 8,
                }}
                resizeMode="contain"
              />
            ) : null}
          </StyledView>

          {/* フッター */}
          <StyledView
            className="flex-row gap-3 border-t px-4 py-3"
            style={{ borderTopColor: PROFILE_COLORS.divider }}
          >
            {/* キャンセルボタン */}
            <StyledPressable
              className="flex-1 items-center rounded-xl py-3 active:opacity-80"
              style={{ backgroundColor: PROFILE_COLORS.cardSecondary }}
              onPress={onClose}
              disabled={isSharing}
            >
              <StyledText
                className="font-bold"
                style={{ color: PROFILE_COLORS.textSecondary }}
              >
                キャンセル
              </StyledText>
            </StyledPressable>

            {/* シェアボタン */}
            <StyledPressable
              className="flex-1 flex-row items-center justify-center rounded-xl py-3 active:opacity-80"
              style={{
                backgroundColor:
                  previewUri && !isGenerating
                    ? PROFILE_COLORS.goldButton
                    : PROFILE_COLORS.cardSecondary,
              }}
              onPress={onShare}
              disabled={!previewUri || isGenerating || isSharing}
            >
              {isSharing ? (
                <Spinner size="sm" color="white" />
              ) : (
                <>
                  <StyledIonicons
                    name="share-outline"
                    size={20}
                    style={{
                      color:
                        previewUri && !isGenerating
                          ? PROFILE_COLORS.textWhite
                          : PROFILE_COLORS.textSecondary,
                    }}
                  />
                  <StyledText
                    className="ml-2 font-bold"
                    style={{
                      color:
                        previewUri && !isGenerating
                          ? PROFILE_COLORS.textWhite
                          : PROFILE_COLORS.textSecondary,
                    }}
                  >
                    シェア
                  </StyledText>
                </>
              )}
            </StyledPressable>
          </StyledView>
        </StyledView>
      </AnimatedView>
    </Modal>
  );
};
