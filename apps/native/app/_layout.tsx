import "@/globals.css";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/contexts/auth-context";
import { PopupProvider } from "@/contexts/popup-context";
import { PopupOverlay } from "@/features/popup";
import { useAppFonts } from "@/lib/fonts";
import { initializeOneSignal } from "@/lib/onesignal";

export default function RootLayout() {
  // 全フォントを一括読み込み
  const fontsLoaded = useAppFonts();

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
