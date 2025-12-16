import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { TimelineCard, useTimeline } from "@/features/timeline";

const StyledView = withUniwind(View);
const _StyledText = withUniwind(Text);
const StyledTouchableOpacity = withUniwind(TouchableOpacity);
const StyledIonicons = withUniwind(Ionicons);
const StyledAnimatedView = withUniwind(Animated.View);
const StyledAnimatedText = withUniwind(Animated.Text);

const HEADER_HEIGHT = 70;

export const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { timelineData } = useTimeline();

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  const headerTextOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  return (
    <StyledView className="flex-1 bg-background">
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <View className="gap-3 p-4">
          {timelineData.map((item) => (
            <TimelineCard
              key={item.id}
              username={item.username}
              content={item.content}
              timeAgo={item.timeAgo}
            />
          ))}
        </View>
      </Animated.ScrollView>

      <StyledAnimatedView
        className="absolute top-0 right-0 left-0 border-border border-b bg-blue-500 px-4"
        style={{
          paddingTop: insets.top + 22,
          paddingBottom: 12,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <StyledAnimatedText
          className="font-bold text-foreground text-xl"
          style={{ opacity: headerTextOpacity }}
        >
          タイムライン
        </StyledAnimatedText>
      </StyledAnimatedView>

      <StyledView
        className="absolute right-0 bottom-0 p-4"
        style={{ paddingBottom: insets.bottom - 20 }}
      >
        <StyledTouchableOpacity
          className="size-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
          onPress={() => router.push("/(app)/diary/new")}
        >
          <StyledIonicons
            name="add"
            size={32}
            className="text-primary-foreground"
          />
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
