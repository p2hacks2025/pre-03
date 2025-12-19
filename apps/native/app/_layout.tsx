import "@/globals.css";
import {
  DotGothic16_400Regular,
  useFonts as useDotGothicFonts,
} from "@expo-google-fonts/dotgothic16";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/contexts/auth-context";
import { PopupProvider } from "@/contexts/popup-context";
import { PopupOverlay } from "@/features/popup";
import { initializeOneSignal } from "@/lib/onesignal";

export default function RootLayout() {
  // ローカルフォント（ZenKurenaido）
  const [localFontsLoaded] = useFonts({
    "ZenKurenaido-Regular": require("../assets/fonts/ZenKurenaido-Regular.ttf"),
  });

  // Google Fonts（DotGothic16）
  const [googleFontsLoaded] = useDotGothicFonts({
    DotGothic16_400Regular,
  });

  const fontsLoaded = localFontsLoaded && googleFontsLoaded;

  useEffect(() => {
    initializeOneSignal();
  }, []);

  // フォントがロードされるまでローディング表示
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <AuthProvider>
          <PopupProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <PopupOverlay />
          </PopupProvider>
        </AuthProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
