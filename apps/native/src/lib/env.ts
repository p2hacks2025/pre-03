import { nativeClientKeys } from "@packages/env";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { z } from "zod";

const envSchema = z.object(nativeClientKeys);

/**
 * Android エミュレータ用に localhost を 10.0.2.2 に変換
 * Android エミュレータでは localhost がホストマシンを指さないため
 */
const convertLocalhostForAndroid = (url: string): string => {
  if (Platform.OS === "android" && !Device.isDevice) {
    return url.replace("localhost", "10.0.2.2");
  }
  return url;
};

/**
 * API URLを動的に解決
 * - 実機: API_REMOTE_URL を優先（未設定なら API_BASE_URL）
 * - シミュレータ: API_BASE_URL を使用（Android は 10.0.2.2 に変換）
 */
const resolveApiBaseUrl = (): string => {
  const localUrl = Constants.expoConfig?.extra?.API_BASE_URL;
  const remoteUrl = Constants.expoConfig?.extra?.API_REMOTE_URL;

  // 実機の場合はリモートURLを優先
  if (Device.isDevice && remoteUrl) {
    return remoteUrl;
  }

  const baseUrl = localUrl ?? "http://localhost:4001";
  return convertLocalhostForAndroid(baseUrl);
};

const rawEnv = {
  API_BASE_URL: resolveApiBaseUrl(),
  API_REMOTE_URL: Constants.expoConfig?.extra?.API_REMOTE_URL,
  ENVIRONMENT: Constants.expoConfig?.extra?.ENVIRONMENT,
  LOG_LEVEL: Constants.expoConfig?.extra?.LOG_LEVEL,
};

export const env = envSchema.parse(rawEnv);

export type Env = typeof env;
