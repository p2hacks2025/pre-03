import type { ApiClient } from "@packages/api-contract";
import type { Profile, User } from "@packages/schema/auth";
import { ErrorResponseSchema } from "@packages/schema/common/error";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { tokenManager } from "@/features/auth/lib/token-manager";
import { tokenStorage } from "@/features/auth/lib/token-storage";
import { popupStorage } from "@/features/popup/lib/popup-storage";
import { useAppStateRefresh } from "@/hooks/use-app-state-refresh";
import {
  client,
  createAuthenticatedClient,
  createAuthenticatedClientWithRetry,
} from "@/lib/api";
import {
  clearOneSignalExternalUserId,
  setOneSignalExternalUserId,
} from "@/lib/onesignal";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
  refreshAuth: () => Promise<void>;
  /** 401自動リトライ付き認証クライアントを取得 */
  getAuthenticatedClient: () => ApiClient;
  /** トークンをリフレッシュ */
  refreshTokenAsync: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // リフレッシュの競合防止用
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  const isAuthenticated = useMemo(
    () => !!user && !!accessToken,
    [user, accessToken],
  );

  /**
   * トークンを使って認証状態を確認
   */
  const checkAuth = useCallback(async (token: string): Promise<boolean> => {
    try {
      const authClient = createAuthenticatedClient(token);
      const res = await authClient.user.me.$get();
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        setAccessToken(token);
        // OneSignal に external_id を登録（通知の送信先として識別）
        try {
          await setOneSignalExternalUserId(data.user.id);
        } catch (error) {
          console.warn("Failed to set OneSignal user ID:", error);
        }
        return true;
      }
      // 認証失敗時はトークンを削除
      await tokenStorage.clearTokens();
      try {
        await clearOneSignalExternalUserId();
      } catch (error) {
        console.warn("Failed to clear OneSignal user ID:", error);
      }
      setUser(null);
      setProfile(null);
      setAccessToken(null);
      return false;
    } catch {
      await tokenStorage.clearTokens();
      try {
        await clearOneSignalExternalUserId();
      } catch (error) {
        console.warn("Failed to clear OneSignal user ID:", error);
      }
      setUser(null);
      setProfile(null);
      setAccessToken(null);
      return false;
    }
  }, []);

  /**
   * リフレッシュトークンを使ってアクセストークンを更新
   * 競合防止：既にリフレッシュ中の場合は既存のPromiseを返す
   */
  const tryRefreshToken = useCallback(async (): Promise<boolean> => {
    // 既にリフレッシュ中の場合は既存のPromiseを返す
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const doRefresh = async (): Promise<boolean> => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      try {
        const res = await client.auth.refresh.$post({
          json: { refreshToken },
        });

        if (res.ok) {
          const data = await res.json();

          await tokenStorage.setAccessToken(data.session.accessToken);
          await tokenStorage.setRefreshToken(data.session.refreshToken);
          // expiresAt を保存
          if (data.session.expiresAt) {
            await tokenManager.setExpiresAt(data.session.expiresAt);
          }

          return await checkAuth(data.session.accessToken);
        }
      } catch {
        // リフレッシュ失敗
      }

      await tokenStorage.clearTokens();
      await tokenManager.clearExpiresAt();
      return false;
    };

    // Promiseを作成してrefに保存
    refreshPromiseRef.current = doRefresh().finally(() => {
      refreshPromiseRef.current = null;
    });

    return refreshPromiseRef.current;
  }, [checkAuth]);

  /**
   * 初期化時にSecureStoreからトークンを読み込んで認証確認
   * アクセストークンが無効な場合はリフレッシュを試行
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = await tokenStorage.getAccessToken();
      if (storedToken) {
        const success = await checkAuth(storedToken);
        if (!success) {
          await tryRefreshToken();
        }
      } else {
        await tryRefreshToken();
      }
      setIsLoading(false);
    };
    initAuth();
  }, [checkAuth, tryRefreshToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await client.auth.login.$post({
        json: { email, password },
      });

      if (!res.ok) {
        const errorData = ErrorResponseSchema.parse(await res.json());
        throw new Error(errorData.error.message);
      }

      const data = await res.json();

      // トークンを保存
      await tokenStorage.setAccessToken(data.session.accessToken);
      if (data.session.refreshToken) {
        await tokenStorage.setRefreshToken(data.session.refreshToken);
      }
      // expiresAt を保存
      if (data.session.expiresAt) {
        await tokenManager.setExpiresAt(data.session.expiresAt);
      }

      // 認証状態を確認して user/profile を取得
      await checkAuth(data.session.accessToken);
    },
    [checkAuth],
  );

  const signup = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await client.auth.signup.$post({
        json: { email, password, displayName },
      });

      if (!res.ok) {
        const errorData = ErrorResponseSchema.parse(await res.json());
        throw new Error(errorData.error.message);
      }

      const data = await res.json();

      // トークンを保存
      await tokenStorage.setAccessToken(data.session.accessToken);
      if (data.session.refreshToken) {
        await tokenStorage.setRefreshToken(data.session.refreshToken);
      }
      // expiresAt を保存
      if (data.session.expiresAt) {
        await tokenManager.setExpiresAt(data.session.expiresAt);
      }

      // 認証状態を確認して user/profile を取得
      await checkAuth(data.session.accessToken);
    },
    [checkAuth],
  );

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        const authClient = createAuthenticatedClient(accessToken);
        await authClient.auth.logout.$post();
      }
    } catch {
      // ログアウト失敗してもクライアント側はクリア
    }
    await tokenStorage.clearTokens();
    await tokenManager.clearExpiresAt();
    await popupStorage.clearLastLaunchDate();
    try {
      await clearOneSignalExternalUserId();
    } catch (error) {
      console.warn("Failed to clear OneSignal user ID:", error);
    }
    setUser(null);
    setProfile(null);
    setAccessToken(null);
  }, [accessToken]);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile((prev: Profile | null) =>
      prev ? { ...prev, ...updates } : null,
    );
  }, []);

  const refreshAuth = useCallback(async () => {
    const storedToken = await tokenStorage.getAccessToken();
    if (storedToken) {
      const success = await checkAuth(storedToken);
      if (!success) {
        await tryRefreshToken();
      }
    } else {
      await tryRefreshToken();
    }
  }, [checkAuth, tryRefreshToken]);

  /**
   * 401自動リトライ付き認証クライアントを取得
   */
  const getAuthenticatedClient = useCallback((): ApiClient => {
    return createAuthenticatedClientWithRetry(
      () => tokenStorage.getAccessToken(),
      tryRefreshToken,
    );
  }, [tryRefreshToken]);

  // AppState変化時（バックグラウンド→フォアグラウンド）にリフレッシュを試行
  useAppStateRefresh(refreshAuth);

  const value = useMemo(
    () => ({
      user,
      profile,
      accessToken,
      isLoading,
      isAuthenticated,
      login,
      signup,
      logout,
      updateProfile,
      refreshAuth,
      getAuthenticatedClient,
      refreshTokenAsync: tryRefreshToken,
    }),
    [
      user,
      profile,
      accessToken,
      isLoading,
      isAuthenticated,
      login,
      signup,
      logout,
      updateProfile,
      refreshAuth,
      getAuthenticatedClient,
      tryRefreshToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
