import { forwardRef } from "react";
import { Image, type ImageSourcePropType, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { withUniwind } from "uniwind";

import { SHARE_IMAGE, STATS_CARD, WORLD_IMAGE } from "../lib/share-constants";
import { ShareStatsCard, type ShareStatsCardProps } from "./share-stats-card";

const StyledView = withUniwind(View);
const StyledImage = withUniwind(Image);

// ベース画像とデフォルト世界画像の読み込み
const ShareBaseImage = require("../../../../assets/share.png");
const DefaultWorldImage = require("../../../../assets/world-example.png");

export interface ShareImageViewProps extends ShareStatsCardProps {
  /** 週間ワールド画像URL（nullの場合はデフォルト画像を使用） */
  weeklyWorldImageUrl: string | null;
}

/**
 * シェア画像キャプチャ用View
 *
 * ViewShotでキャプチャするためのコンポーネント。
 * 画面外（position: absolute, left: -9999）に配置して使用。
 *
 * @example
 * ```tsx
 * const viewShotRef = useRef<ViewShot>(null);
 *
 * // キャプチャ実行
 * const uri = await viewShotRef.current?.capture();
 *
 * // JSX（画面外に配置）
 * <ShareImageView
 *   ref={viewShotRef}
 *   weeklyWorldImageUrl={weeklyWorldImageUrl}
 *   avatarUrl={avatarUrl}
 *   displayName={displayName}
 *   streakDays={streakDays}
 *   totalPosts={totalPosts}
 *   worldCount={worldCount}
 * />
 * ```
 */
export const ShareImageView = forwardRef<ViewShot, ShareImageViewProps>(
  (
    {
      weeklyWorldImageUrl,
      avatarUrl,
      displayName,
      streakDays,
      totalPosts,
      worldCount,
    },
    ref,
  ) => {
    // 世界画像のソースを決定
    const worldImageSource: ImageSourcePropType = weeklyWorldImageUrl
      ? { uri: weeklyWorldImageUrl }
      : DefaultWorldImage;

    return (
      <StyledView
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
        }}
      >
        <ViewShot
          ref={ref}
          options={{
            format: "png",
            quality: 1.0,
            result: "tmpfile",
            // 高画質でキャプチャ（後でImageManipulatorでリサイズ）
            useRenderInContext: true,
          }}
          style={{
            width: SHARE_IMAGE.WIDTH,
            height: SHARE_IMAGE.HEIGHT,
          }}
        >
          <StyledView
            style={{
              width: SHARE_IMAGE.WIDTH,
              height: SHARE_IMAGE.HEIGHT,
            }}
          >
            {/* ベース画像（背景） */}
            <StyledImage
              source={ShareBaseImage}
              style={{
                position: "absolute",
                width: SHARE_IMAGE.WIDTH,
                height: SHARE_IMAGE.HEIGHT,
              }}
              resizeMode="cover"
            />

            {/* 週間ワールド画像（左側） */}
            <StyledImage
              source={worldImageSource}
              style={{
                position: "absolute",
                left: WORLD_IMAGE.LEFT,
                top: WORLD_IMAGE.TOP,
                width: WORLD_IMAGE.SIZE,
                height: WORLD_IMAGE.SIZE,
              }}
              resizeMode="contain"
            />

            {/* 統計カード（右側） */}
            <StyledView
              style={{
                position: "absolute",
                right: STATS_CARD.RIGHT,
                top: STATS_CARD.TOP,
              }}
            >
              <ShareStatsCard
                avatarUrl={avatarUrl}
                displayName={displayName}
                streakDays={streakDays}
                totalPosts={totalPosts}
                worldCount={worldCount}
              />
            </StyledView>
          </StyledView>
        </ViewShot>
      </StyledView>
    );
  },
);

ShareImageView.displayName = "ShareImageView";
