import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import type { ConfigContext, ExpoConfig } from "expo/config";

dotenv.config({ path: ".env", override: true });

// ビルド設定を読み込む
const buildConfigPath = path.join(__dirname, "build-config.json");
const buildConfig = fs.existsSync(buildConfigPath)
  ? JSON.parse(fs.readFileSync(buildConfigPath, "utf-8"))
  : { ios: { buildNumber: 1 }, android: { versionCode: 1 } };

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
      NSLocationWhenInUseUsageDescription:
        "このアプリは位置情報機能を使用しません。",
    },
    buildNumber: String(buildConfig.ios.buildNumber),
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
    [
      "onesignal-expo-plugin",
      {
        mode: "development",
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
    ONESIGNAL_APP_ID: "0de60db5-b01c-46a6-89d8-7e4e03f1825a",
  },
});
