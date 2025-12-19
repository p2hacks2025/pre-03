import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { withUniwind } from "uniwind";

import {
  DetailDiary,
  DetailTabs,
  DetailTimeline,
} from "@/features/reflection/components";
import { useDetailDiary } from "@/features/reflection/hooks";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);

type TabType = "diary" | "timeline";

const shadowSvg = `<svg width="459" height="216" viewBox="0 0 459 216" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_f_33_102)">
<ellipse cx="229.5" cy="108" rx="219.5" ry="98" fill="#57ABBC"/>
</g>
<defs>
<filter id="filter0_f_33_102" x="0" y="0" width="459" height="216" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_33_102"/>
</filter>
</defs>
</svg>`;

export const ReflectionDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("diary");
  const { data, handlePrevWorld, handleNextWorld } = useDetailDiary();

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -5],
  });

  const shadowScale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.4, 1.2],
  });

  return (
    <StyledView
      className="flex-1 bg-[#4ECCDD]"
      style={{ paddingTop: insets.top, paddingBottom: 0 }}
    >
      <StyledView className="items-center justify-center px-6 py-6">
        <StyledText className="text-white text-xl">
          {data.startDate}~{data.endDate}
        </StyledText>
      </StyledView>

      <StyledView className="relative h-60 items-center justify-center">
        <StyledPressable
          className="absolute left-4 z-10"
          onPress={handlePrevWorld}
        >
          <StyledView className="h-12 w-12 items-center justify-center">
            <View style={{ transform: [{ rotate: "270deg" }] }}>
              <Ionicons name="triangle" size={24} color="#DF6800" />
            </View>
          </StyledView>
        </StyledPressable>

        <StyledView className="items-center justify-center">
          <Animated.View
            style={{
              position: "absolute",
              bottom: 30,
              transform: [{ scaleX: shadowScale }, { scaleY: shadowScale }],
            }}
          >
            <SvgXml xml={shadowSvg} width={200} height={90} opacity={0.6} />
          </Animated.View>

          <Animated.Image
            source={require("../../../assets/world-example.png")}
            style={{
              width: 300,
              height: 300,
              transform: [{ translateY }],
            }}
            resizeMode="contain"
          />
        </StyledView>

        <StyledPressable
          className="absolute right-4 z-10"
          onPress={handleNextWorld}
        >
          <StyledView className="h-12 w-12 items-center justify-center">
            <View style={{ transform: [{ rotate: "90deg" }] }}>
              <Ionicons name="triangle" size={24} color="#DF6800" />
            </View>
          </StyledView>
        </StyledPressable>
      </StyledView>

      <DetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <StyledView className="flex-1">
        {activeTab === "diary" ? <DetailDiary /> : <DetailTimeline />}
      </StyledView>
    </StyledView>
  );
};
