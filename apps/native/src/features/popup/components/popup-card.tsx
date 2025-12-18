import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledImage = withUniwind(Image);
const StyledPressable = withUniwind(Pressable);
const AnimatedView = withUniwind(Animated.View);

interface PopupCardProps {
  title: string;
  message: string;
  imageUrl?: string | null;
  closeButtonLabel?: string;
  onClose: () => void;
  /** 残りのポップアップ数（キュー表示用） */
  remainingCount?: number;
}

/**
 * PopupCard
 * 単一のポップアップカード UI
 */
export const PopupCard = ({
  title,
  imageUrl,
  closeButtonLabel = "OK",
  onClose,
  remainingCount = 0,
}: PopupCardProps) => {
  return (
    <AnimatedView
      entering={FadeInUp.duration(300).springify()}
      exiting={FadeOutDown.duration(200)}
      className="w-full max-w-sm"
    >
      <StyledView className="overflow-hidden rounded-3xl bg-[#C4A574] p-4 shadow-xl">
        {/* タイトル（上部） */}
        <StyledText className="mb-4 text-center font-bold text-white text-xl">
          {title}
        </StyledText>

        {/* 画像エリア（中央） */}
        {imageUrl && (
          <StyledView className="mb-4 overflow-hidden rounded-xl">
            <StyledImage
              source={{ uri: imageUrl }}
              className="aspect-square w-full"
              resizeMode="contain"
            />
          </StyledView>
        )}

        {/* 閉じるボタン */}
        <StyledPressable
          onPress={onClose}
          className="mx-auto rounded-lg bg-[#E8DCC8] px-12 py-3"
        >
          <StyledText className="text-center font-bold text-black text-lg">
            {closeButtonLabel}
          </StyledText>
        </StyledPressable>

        {/* 残りのポップアップ数表示 */}
        {remainingCount > 0 && (
          <StyledText className="mt-3 text-center text-white/70 text-xs">
            あと {remainingCount} 件のお知らせがあります
          </StyledText>
        )}
      </StyledView>
    </AnimatedView>
  );
};
