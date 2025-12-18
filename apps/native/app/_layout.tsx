import "@/globals.css";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/contexts/auth-context";
import { PopupProvider } from "@/contexts/popup-context";
import { PopupOverlay } from "@/features/popup";
import { initializeOneSignal } from "@/lib/onesignal";

export default function RootLayout() {
  useEffect(() => {
    initializeOneSignal();
  }, []);

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
