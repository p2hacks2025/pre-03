import * as SecureStore from "expo-secure-store";

const EXPIRES_AT_KEY = "auth_expires_at";

/**
 * トークン有効期限のリフレッシュ推奨マージン（秒）
 */
const REFRESH_MARGIN_SECONDS = 5 * 60;

/**
 * トークンのライフサイクル管理
 * - expiresAt の永続化
 * - 期限切れチェック
 */
export const tokenManager = {
  /**
   * トークン有効期限を取得
   * @returns Unix タイムスタンプ（秒）または null
   */
  async getExpiresAt(): Promise<number | null> {
    try {
      const value = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
      if (value) {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * トークン有効期限を保存
   * @param expiresAt Unix タイムスタンプ（秒）
   */
  async setExpiresAt(expiresAt: number): Promise<void> {
    await SecureStore.setItemAsync(EXPIRES_AT_KEY, expiresAt.toString());
  },

  /**
   * トークンが期限切れ間近かどうか
   */
  async isTokenExpiringSoon(): Promise<boolean> {
    const expiresAt = await this.getExpiresAt();
    if (expiresAt === null) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return expiresAt - now <= REFRESH_MARGIN_SECONDS;
  },

  /**
   * トークンが完全に期限切れかどうか
   */
  async isTokenExpired(): Promise<boolean> {
    const expiresAt = await this.getExpiresAt();
    if (expiresAt === null) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return expiresAt <= now;
  },

  /**
   * 有効期限情報をクリア
   */
  async clearExpiresAt(): Promise<void> {
    await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
  },
};
