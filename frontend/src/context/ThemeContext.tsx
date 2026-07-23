import { CssBaseline, ThemeProvider } from '@mui/material';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createAppTheme } from '../theme/theme';
import type { AppResolvedThemeMode } from '../theme/theme';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedMode: AppResolvedThemeMode;
  setPreference: (preference: ThemePreference) => void;
}

const STORAGE_KEY = 'sol.theme.preference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemMode = (): AppResolvedThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialPreference = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return 'system';
};

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const [preference, setPreference] = useState<ThemePreference>(getInitialPreference);
  const [systemMode, setSystemMode] = useState<AppResolvedThemeMode>(getSystemMode);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      setSystemMode(media.matches ? 'dark' : 'light');
    };

    listener();
    media.addEventListener('change', listener);
    return () => {
      media.removeEventListener('change', listener);
    };
  }, []);

  const resolvedMode: AppResolvedThemeMode = preference === 'system' ? systemMode : preference;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', resolvedMode);
  }, [resolvedMode]);

  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolvedMode,
      setPreference
    }),
    [preference, resolvedMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemePreference = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemePreference must be used within AppThemeProvider');
  }
  return context;
};
