import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { HEADER_HEIGHT } from "./constants";
import type { HeaderProps } from "./types";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledAnimatedView = withUniwind(Animated.View);
const StyledAnimatedText = withUniwind(Animated.Text);

export const Header = ({
  title,
  subtitle,
  leftContent,
  rightContent,
  animated = false,
  scrollY,
  backgroundColor,
  showBorder = false,
}: HeaderProps) => {
  const insets = useSafeAreaInsets();

  const isThreeColumn = leftContent || rightContent;

  // アニメーション値の計算
  const titleOpacity =
    animated && scrollY
      ? scrollY.interpolate({
          inputRange: [0, 50],
          outputRange: [1, 0],
          extrapolate: "clamp",
        })
      : 1;

  const headerTranslateY =
    animated && scrollY
      ? scrollY.interpolate({
          inputRange: [0, HEADER_HEIGHT],
          outputRange: [0, -HEADER_HEIGHT + 30],
          extrapolate: "clamp",
        })
      : 0;

  const containerStyle = {
    paddingTop: insets.top,
    paddingBottom: 12,
    ...(animated && scrollY
      ? { transform: [{ translateY: headerTranslateY }] }
      : {}),
  };

  const bgClass = backgroundColor || "bg-white";
  const borderClass = showBorder ? "border-border border-b" : "";

  // 3カラムレイアウト（leftContent または rightContent がある場合）
  if (isThreeColumn) {
    return (
      <StyledAnimatedView
        className={`absolute top-0 right-0 left-0 z-10 ${bgClass} ${borderClass} px-4`}
        style={containerStyle}
      >
        <StyledView
          className="flex-row items-center justify-between"
          style={{ height: HEADER_HEIGHT - 12 }}
        >
          <StyledView className="w-12 items-start">
            {leftContent || <StyledView className="w-12" />}
          </StyledView>

          <StyledView className="flex-1 items-center">
            {animated && scrollY ? (
              <StyledAnimatedText
                className="text-center font-bold text-2xl text-foreground"
                style={{ opacity: titleOpacity }}
              >
                {title}
              </StyledAnimatedText>
            ) : (
              <StyledText className="text-center font-bold text-2xl text-foreground">
                {title}
              </StyledText>
            )}
            {subtitle && (
              <StyledText className="font-bold text-foreground text-sm">
                {subtitle}
              </StyledText>
            )}
          </StyledView>

          <StyledView className="w-12 items-end">
            {rightContent || <StyledView className="w-12" />}
          </StyledView>
        </StyledView>
      </StyledAnimatedView>
    );
  }

  // センタータイトルレイアウト
  return (
    <StyledAnimatedView
      className={`absolute top-0 right-0 left-0 z-10 ${bgClass} ${borderClass} px-4`}
      style={containerStyle}
    >
      <StyledView
        className="items-center justify-center"
        style={{ height: HEADER_HEIGHT - 12 }}
      >
        {animated && scrollY ? (
          <StyledAnimatedText
            className="font-bold text-2xl text-foreground"
            style={{ opacity: titleOpacity }}
          >
            {title}
          </StyledAnimatedText>
        ) : (
          <StyledText className="font-bold text-2xl text-foreground">
            {title}
          </StyledText>
        )}
        {subtitle && (
          <StyledText className="font-bold text-foreground text-sm">
            {subtitle}
          </StyledText>
        )}
      </StyledView>
    </StyledAnimatedView>
  );
};
