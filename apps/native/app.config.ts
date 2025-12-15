import dotenv from "dotenv";
import type { ConfigContext, ExpoConfig } from "expo/config";

dotenv.config({ path: ".env", override: true });

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "native",
  slug: "native",
  scheme: "native",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router", "expo-font"],
  extra: {
    API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:4001",
    API_REMOTE_URL: process.env.API_REMOTE_URL,
    ENVIRONMENT: process.env.ENVIRONMENT ?? "native",
    LOG_LEVEL: process.env.LOG_LEVEL ?? "debug",
  },
});
