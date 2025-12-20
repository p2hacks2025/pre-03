import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import { FONT_FAMILY } from "@/lib/fonts";
import { logger } from "@/lib/logger";

import { useShareImage } from "../hooks/use-share-image";
import { PROFILE_COLORS } from "../lib/colors";
import { ShareDialog } from "./share-dialog";
import { ShareImageView } from "./share-image-view";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);

/**
 * 「今の世界をシェア」ボタン
 *
 * タップ時にシェアダイアログを表示し、生成した画像をネイティブシェア機能で共有。
 */
export const ShareWorldButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    viewShotRef,
    previewUri,
    isGenerating,
    isSharing,
    error,
    isLoading,
    generateImage,
    shareImage,
    clearPreview,
    shareData,
  } = useShareImage();

  // ダイアログを開く
  const handlePress = useCallback(() => {
    logger.info("Share button pressed");
    setIsDialogOpen(true);
  }, []);

  // ダイアログを閉じる
  const handleClose = useCallback(() => {
    setIsDialogOpen(false);
    clearPreview();
  }, [clearPreview]);

  // シェア実行
  const handleShare = useCallback(async () => {
    await shareImage();
  }, [shareImage]);

  // ダイアログが開いたら画像を生成
  useEffect(() => {
    if (isDialogOpen && !previewUri && !isGenerating) {
      // 少し遅延させてViewShotがマウントされるのを待つ
      const timer = setTimeout(() => {
        generateImage();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDialogOpen, previewUri, isGenerating, generateImage]);

  return (
    <>
      {/* 画面外に配置されるシェア画像キャプチャ用View */}
      <ShareImageView
        ref={viewShotRef}
        weeklyWorldImageUrl={shareData.weeklyWorldImageUrl}
        avatarUrl={shareData.avatarUrl}
        displayName={shareData.displayName}
        streakDays={shareData.streakDays}
        totalPosts={shareData.totalPosts}
        worldCount={shareData.worldCount}
      />

      {/* シェアボタン */}
      <StyledView className="mt-4 items-center">
        <StyledPressable
          className="rounded-xl px-10 py-3 active:opacity-80"
          style={{
            backgroundColor: isLoading
              ? PROFILE_COLORS.cardSecondary
              : PROFILE_COLORS.goldButton,
          }}
          onPress={handlePress}
          disabled={isLoading}
        >
          <StyledText
            className="text-center font-bold text-lg"
            style={{
              color: isLoading
                ? PROFILE_COLORS.textSecondary
                : PROFILE_COLORS.textWhite,
              lineHeight: 24,
              fontFamily: FONT_FAMILY.MADOUFMG,
            }}
          >
            今の世界を{"\n"}シェア
          </StyledText>
        </StyledPressable>
      </StyledView>

      {/* シェアダイアログ */}
      <ShareDialog
        visible={isDialogOpen}
        previewUri={previewUri}
        isGenerating={isGenerating}
        isSharing={isSharing}
        error={error}
        onClose={handleClose}
        onShare={handleShare}
      />
    </>
  );
};
