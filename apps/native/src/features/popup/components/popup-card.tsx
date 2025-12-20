import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { withUniwind } from "uniwind";

import { FONT_FAMILY } from "@/lib/fonts";

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

export const PopupCard = ({
  title,
  message,
  imageUrl,
  closeButtonLabel = "OK",
  onClose,
  remainingCount = 0,
}: PopupCardProps) => {
  const image = imageUrl ? { uri: imageUrl } : undefined;

  return (
    <AnimatedView
      entering={FadeInUp.duration(300).springify()}
      exiting={FadeOutDown.duration(200)}
      className="w-full max-w-sm"
    >
      <StyledView className="overflow-hidden rounded-3xl bg-[#C4A574] p-4 shadow-xl">
        <StyledText
          className="mb-2 text-center font-bold text-white text-xl"
          style={{ fontFamily: FONT_FAMILY.MADOUFMG }}
        >
          {title}
        </StyledText>

        <StyledText
          className="mb-4 text-center text-base text-white"
          style={{ fontFamily: FONT_FAMILY.MADOUFMG }}
        >
          {message}
        </StyledText>

        {image && (
          <StyledView className="mb-4 items-center">
            <StyledView className="h-60 w-60 overflow-hidden rounded-xl">
              <StyledImage
                source={image}
                className="h-full w-full"
                resizeMode="cover"
              />
            </StyledView>
          </StyledView>
        )}

        <StyledPressable
          onPress={onClose}
          className="mx-auto rounded-lg bg-[#E8DCC8] px-12 py-3"
        >
          <StyledText className="text-center font-bold text-black text-lg">
            {closeButtonLabel}
          </StyledText>
        </StyledPressable>

        {remainingCount > 0 && (
          <StyledText className="mt-3 text-center text-white/70 text-xs">
            あと {remainingCount} 件のお知らせがあります
          </StyledText>
        )}
      </StyledView>
    </AnimatedView>
  );
};
