"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ErrorResponseSchema } from "@packages/schema/common/error";

import { client } from "@/lib/api";

import type { Profile, User } from "@packages/schema/auth";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 認証状態を確認
   * HttpOnly Cookie を使用するため、/user/me API を叩いて確認
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await client.user.me.$get();
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        return true;
      }
      setUser(null);
      setProfile(null);
      return false;
    } catch {
      setUser(null);
      setProfile(null);
      return false;
    }
  }, []);

  // 初期化（ページロード時に Cookie で認証状態を確認）
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
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
      setUser(data.user);
      await checkAuth();
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
      setUser(data.user);
      await checkAuth();
    },
    [checkAuth],
  );

  const logout = useCallback(async () => {
    try {
      await client.auth.logout.$post();
    } catch {
      // ログアウト失敗してもクライアント側はクリア
    }
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
      refreshAuth,
    }),
    [
      user,
      profile,
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
      refreshAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
