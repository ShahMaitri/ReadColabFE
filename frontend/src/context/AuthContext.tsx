import { createContext, useEffect, useMemo, useState } from 'react';
import type { AuthContextValue, AuthUser, AuthResponse } from '../types/auth';
import { authStorage } from '../utils/storage';
import { authService } from '../services/auth.service';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = authStorage.getAccessToken();
    const storedUser = authStorage.getUser<AuthUser>();

    if (token && storedUser) {
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  const login = (response: AuthResponse): void => {
    authStorage.setAccessToken(response.accessToken);
    authStorage.setRefreshToken(response.refreshToken);
    authStorage.setUser(response.user);
    setUser(response.user);
  };

  const logout = (): void => {
    authStorage.clear();
    setUser(null);
  };

  const refreshTokens = async (): Promise<void> => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const response = await authService.refreshToken(refreshToken);
      authStorage.setAccessToken(response.accessToken);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      user,
      login,
      logout,
      refreshTokens
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
