import * as ImageManipulator from "expo-image-manipulator";
import * as Sharing from "expo-sharing";
import { useCallback, useRef, useState } from "react";
import type ViewShot from "react-native-view-shot";

import { useAuth } from "@/contexts/auth-context";
import { logger } from "@/lib/logger";

import { SHARE_OUTPUT } from "../lib/share-constants";
import { useCurrentWeekWorld } from "./use-current-week-world";
import { useProfileStats } from "./use-profile-stats";

/** シェアに必要なデータ */
export interface ShareData {
  /** ユーザー表示名 */
  displayName: string;
  /** アバターURL */
  avatarUrl: string | null;
  /** 週間ワールド画像URL */
  weeklyWorldImageUrl: string | null;
  /** 連続投稿日数 */
  streakDays: number;
  /** 投稿総数 */
  totalPosts: number;
  /** 世界創造数 */
  worldCount: number;
}

export interface UseShareImageReturn {
  /** ViewShotへのref */
  viewShotRef: React.RefObject<ViewShot | null>;
  /** 生成された画像のURI */
  previewUri: string | null;
  /** 画像生成中フラグ */
  isGenerating: boolean;
  /** シェア処理中フラグ */
  isSharing: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** データ読み込み中 */
  isLoading: boolean;
  /** 画像生成関数 */
  generateImage: () => Promise<string | null>;
  /** シェア実行関数 */
  shareImage: () => Promise<void>;
  /** プレビュークリア関数 */
  clearPreview: () => void;
  /** シェアに必要なデータ */
  shareData: ShareData;
}

/**
 * シェア画像の生成とシェア機能を提供するフック
 *
 * @example
 * ```tsx
 * const {
 *   viewShotRef,
 *   previewUri,
 *   isGenerating,
 *   generateImage,
 *   shareImage,
 *   shareData,
 * } = useShareImage();
 *
 * // ダイアログ表示時に画像生成
 * useEffect(() => {
 *   if (isDialogOpen) {
 *     generateImage();
 *   }
 * }, [isDialogOpen]);
 *
 * // シェアボタン押下時
 * const handleShare = () => shareImage();
 * ```
 */
export const useShareImage = (): UseShareImageReturn => {
  const { profile } = useAuth();
  const { weeklyWorldImageUrl, isLoading: isWorldLoading } =
    useCurrentWeekWorld();
  const {
    streakDays,
    totalPosts,
    worldCount,
    isLoading: isStatsLoading,
  } = useProfileStats();

  const viewShotRef = useRef<ViewShot | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // シェアに必要なデータをまとめる
  const shareData: ShareData = {
    displayName: profile?.displayName ?? "ユーザー",
    avatarUrl: profile?.avatarUrl ?? null,
    weeklyWorldImageUrl,
    streakDays,
    totalPosts,
    worldCount,
  };

  // 画像生成（高画質でキャプチャ後、指定サイズにリサイズ）
  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!viewShotRef.current) {
      logger.warn("ViewShot ref is not available");
      setError("画像生成の準備ができていません");
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      logger.info("Capturing share image...");

      // 高画質でキャプチャ
      const capturedUri = await viewShotRef.current.capture?.();

      if (!capturedUri) {
        throw new Error("Failed to capture image");
      }

      logger.info("Image captured, resizing...", { capturedUri });

      // 指定サイズにリサイズ（常に固定サイズでPNG出力）
      const resizedImage = await ImageManipulator.manipulateAsync(
        capturedUri,
        [
          {
            resize: { width: SHARE_OUTPUT.WIDTH, height: SHARE_OUTPUT.HEIGHT },
          },
        ],
        { format: ImageManipulator.SaveFormat.PNG },
      );

      logger.info("Share image generated", {
        uri: resizedImage.uri,
        width: resizedImage.width,
        height: resizedImage.height,
      });

      setPreviewUri(resizedImage.uri);
      return resizedImage.uri;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "画像の生成に失敗しました";
      logger.error("Failed to generate share image", {}, err as Error);
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // シェア実行
  const shareImage = useCallback(async (): Promise<void> => {
    if (!previewUri) {
      logger.warn("No preview URI available for sharing");
      setError("シェアする画像がありません");
      return;
    }

    setIsSharing(true);
    setError(null);

    try {
      // シェア機能が利用可能かチェック
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("シェア機能が利用できません");
      }

      logger.info("Sharing image...", { uri: previewUri });
      await Sharing.shareAsync(previewUri, {
        mimeType: "image/png",
        dialogTitle: "今週の世界をシェア",
      });

      logger.info("Image shared successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "シェアに失敗しました";
      logger.error("Failed to share image", {}, err as Error);
      setError(message);
    } finally {
      setIsSharing(false);
    }
  }, [previewUri]);

  // プレビュークリア
  const clearPreview = useCallback(() => {
    setPreviewUri(null);
    setError(null);
  }, []);

  return {
    viewShotRef,
    previewUri,
    isGenerating,
    isSharing,
    error,
    isLoading: isWorldLoading || isStatsLoading,
    generateImage,
    shareImage,
    clearPreview,
    shareData,
  };
};
