import type { Profile, User } from "@packages/schema/auth";
import { ErrorResponseSchema } from "@packages/schema/common/error";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { tokenStorage } from "@/features/auth/lib/token-storage";
import { client, createAuthenticatedClient } from "@/lib/api";

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
        return true;
      }
      // 認証失敗時はトークンを削除
      await tokenStorage.clearTokens();
      setUser(null);
      setProfile(null);
      setAccessToken(null);
      return false;
    } catch {
      await tokenStorage.clearTokens();
      setUser(null);
      setProfile(null);
      setAccessToken(null);
      return false;
    }
  }, []);

  /**
   * 初期化時にSecureStoreからトークンを読み込んで認証確認
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = await tokenStorage.getAccessToken();
      if (storedToken) {
        await checkAuth(storedToken);
      }
      setIsLoading(false);
    };
    initAuth();
  }, [checkAuth]);

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
      await checkAuth(storedToken);
    }
  }, [checkAuth]);

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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
