const ACCESS_TOKEN_KEY = 'sol_access_token';
const REFRESH_TOKEN_KEY = 'sol_refresh_token';
const USER_KEY = 'sol_auth_user';

export const authStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  getToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  clearToken: (): void => localStorage.removeItem(ACCESS_TOKEN_KEY),
  getUser: <T>(): T | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setUser: <T>(value: T): void => localStorage.setItem(USER_KEY, JSON.stringify(value)),
  clearUser: (): void => localStorage.removeItem(USER_KEY),
  clear: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
