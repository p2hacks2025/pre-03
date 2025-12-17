import dotenv from "dotenv";
import type { ConfigContext, ExpoConfig } from "expo/config";

dotenv.config({ path: ".env", override: true });

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "noval",
  slug: "noval",
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
    bundleIdentifier: "net.uiro.noval-ios",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription:
        "日記に写真を添付するためにフォトライブラリへのアクセスが必要です。",
    },
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
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-image-picker",
      {
        photosPermission:
          "日記に写真を添付するためにフォトライブラリへのアクセスが必要です。",
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "094a0763-1c2d-4e08-a364-665289a4f7ef",
    },
    API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:4001",
    API_REMOTE_URL: process.env.API_REMOTE_URL,
    ENVIRONMENT: process.env.ENVIRONMENT ?? "native",
    LOG_LEVEL: process.env.LOG_LEVEL ?? "debug",
  },
});
